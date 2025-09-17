import { PieChart, Pie, Cell, ResponsiveContainer, } from 'recharts';

interface Allocation {
  name: string;
  symbol: string;
  value: number;
  color: string;
}

interface PortfolioTotalProps {
  total: number;
  allocations: Allocation[];
  lastUpdated: Date;
}

const PortfolioTotal = ({ total, allocations, lastUpdated }: PortfolioTotalProps) => {
  return (
 <div className="bg-card p-4 md:p-6 rounded-lg flex flex-col md:flex-row justify-between items-center shadow-lg">
   <div className="text-center md:text-left">
     <h2 className="text-gray-400 uppercase text-xs">Portfolio Total</h2>
     <p className="text-2xl md:text-4xl font-bold text-white mt-2">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
     <p className="text-gray-500 text-xs mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
   </div>
   <div className="w-full md:w-1/2 h-32 md:h-48 mt-4 md:mt-0">
     <ResponsiveContainer>
       <PieChart>
         <Pie data={allocations.map(a => ({ ...a }))} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={5}>
           {allocations.map((entry, index) => (
             <Cell key={`cell-${index}`} fill={entry.color} />
           ))}
         </Pie>
       </PieChart>
     </ResponsiveContainer>
   </div>
   <div className="mt-4 md:mt-0 w-full md:w-auto">
     <h2 className="text-gray-400 uppercase text-xs mb-2 text-center md:text-left">Allocations</h2>
     <ul className="text-sm text-white space-y-1 flex flex-col items-center md:items-start">
       {allocations.map((a) => (
         <li key={a.name} className="flex items-center">
           <span className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: a.color }}></span>
           {a.name} ({a.symbol}) <span className="text-gray-500 ml-1">{((a.value / total) * 100).toFixed(1)}%</span>
         </li>
       ))}
     </ul>
   </div>
 </div>

   );
};

export default PortfolioTotal;