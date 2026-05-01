import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GoldPriceChart = ({ amount, mode = "lumpSum", duration = 3 }) => {
    // Generate projection data
    const data = useMemo(() => {
        const projection = [];
        const annualGrowth = 0.12;
        const monthlyGrowthRate = annualGrowth / 12;
        const months = duration * 12;
        const principal = parseFloat(amount) || 1000;

        let cumulativeInvestment = principal;
        let currentValue = principal;

        for (let i = 0; i <= months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);

            if (mode === "lumpSum") {
                // Value = Principal * (1 + r)^t
                currentValue = principal * Math.pow(1 + monthlyGrowthRate, i);
            } else {
                // SIP calculation (simplified monthly accumulation)
                // In SIP mode, 'amount' is treated as daily, so monthly is amount * 30
                const monthlyContribution = principal * 30.5;
                if (i > 0) {
                    currentValue = (currentValue + monthlyContribution) * (1 + monthlyGrowthRate);
                } else {
                    currentValue = monthlyContribution;
                }
            }

            projection.push({
                date: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
                value: Math.round(currentValue),
                month: i
            });
        }
        return projection;
    }, [amount, mode, duration]);

    return (
        <div className="returns-chart-container" style={{ width: '100%', height: 200, marginTop: '15px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        interval={11} // Show roughly every year
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.2)" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: 'hsl(var(--foreground))',
                            padding: '5px 10px'
                        }}
                        formatter={(val) => [`₹${val.toLocaleString()}`, 'Projected']}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GoldPriceChart;
