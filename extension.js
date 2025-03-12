const vscode = require('vscode');

let statusBarItem;
let updateInterval;
let currentEarnings = 0;

function activate(context) {
    // 创建状态栏项
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'dailyEarnings.showDetails';
    // 设置背景色和前景色
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.color = '#FFD700'; // 金色
    context.subscriptions.push(statusBarItem);

    // 注册显示详细信息的命令
    let disposable = vscode.commands.registerCommand('dailyEarnings.showDetails', () => {
        showEarningsDetails();
    });
    context.subscriptions.push(disposable);

    // 开始更新状态栏
    startUpdating();
}

function deactivate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}

function startUpdating() {
    updateEarnings();
    // 更新频率改为100毫秒使动画更流畅
    updateInterval = setInterval(updateEarnings, 100);
}

function updateEarnings() {
    const config = vscode.workspace.getConfiguration('dailyEarnings');
    const monthlyIncome = config.get('monthlyIncome');
    const workingDays = config.get('workingDays');
    const workingHours = config.get('workingHours');

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    
    if (now < startOfDay) {
        statusBarItem.text = `$(clock) ¥ 0.00 (+0.00/s)`;
        statusBarItem.tooltip = '工作还没开始呢！';
        currentEarnings = 0;
        return;
    }

    // 计算每秒收入
    const dailyIncome = monthlyIncome / workingDays;
    const hourlyIncome = dailyIncome / workingHours;
    const secondlyIncome = hourlyIncome / 3600;

    // 计算实际已赚金额
    const millisecondsWorked = Math.min(Date.now() - startOfDay.getTime(), workingHours * 3600 * 1000);
    const earnedToday = secondlyIncome * (millisecondsWorked / 1000);

    // 计算动画效果的增量（每100ms的收入）
    const incrementPerInterval = secondlyIncome / 10; // 因为我们每100ms更新一次
    currentEarnings = Math.min(currentEarnings + incrementPerInterval, earnedToday);

    // 更多金钱相关的图标选项，使用金色字符
    const icons = [
        '$(gold)',              // 金币
        '$(star-full)',         // 星星
        '$(gem)',              // 宝石
        '$(trophy)',           // 奖杯
        '$(sparkle)',          // 闪光
    ];
    const iconIndex = Math.floor((Date.now() / 500) % icons.length);
    
    // 格式化显示
    const formattedTotal = currentEarnings.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });

    const formattedRate = secondlyIncome.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    });

    // 使用特殊字符来增加金色效果
    statusBarItem.text = `${icons[iconIndex]} 💰 ¥ ${formattedTotal} (+${formattedRate}/s) 💰`;
    statusBarItem.tooltip = `今日已赚: ¥${earnedToday.toFixed(2)}\n点击查看详细信息`;
    statusBarItem.show();
}

function showEarningsDetails() {
    const config = vscode.workspace.getConfiguration('dailyEarnings');
    const monthlyIncome = config.get('monthlyIncome');
    const workingDays = config.get('workingDays');
    const workingHours = config.get('workingHours');

    const dailyIncome = monthlyIncome / workingDays;
    const hourlyIncome = dailyIncome / workingHours;
    const minuteIncome = hourlyIncome / 60;
    const secondIncome = minuteIncome / 60;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const millisecondsWorked = Math.min(Date.now() - startOfDay.getTime(), workingHours * 3600 * 1000);
    const earnedToday = (hourlyIncome / 3600) * (millisecondsWorked / 1000);

    vscode.window.showInformationMessage(
        `收入详情:\n` +
        `今日已赚: ¥${earnedToday.toFixed(2)}\n` +
        `月收入: ¥${monthlyIncome.toFixed(2)}\n` +
        `日收入: ¥${dailyIncome.toFixed(2)}\n` +
        `时收入: ¥${hourlyIncome.toFixed(2)}\n` +
        `分收入: ¥${minuteIncome.toFixed(2)}\n` +
        `秒收入: ¥${secondIncome.toFixed(2)}`
    );
}

module.exports = {
    activate,
    deactivate
}; 