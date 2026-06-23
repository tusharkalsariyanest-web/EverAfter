import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Package, Truck, Search, Eye, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // Fetch all orders, newest first
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      items: true, // Pulls the gowns inside each order
    }
  });

  return (
    <div className="min-h-screen bg-[#FDF6F5] pb-20 pt-10 text-[#2d1b1b]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C0858B] hover:text-[#8c363e] transition-colors mb-6 font-bold">
              <ChevronLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="font-serif text-4xl tracking-tight">Fulfillment Center</h1>
            <p className="text-sm text-gray-500 mt-2">Manage dispatch, assign couriers, and track high-value shipments.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-[#E8D0D2]/60 shadow-sm">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search order ID or phone..." 
              className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-white rounded-2xl border border-[#E8D0D2]/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FCFBF9] border-b border-[#E8D0D2]/60 text-[10px] uppercase tracking-widest text-[#8A4A52]">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Customer Info</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Logistics Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D0D2]/40">
                {allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FCFBF9]/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm">#{order.id}</span>
                    </td>
                    
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#2d1b1b]">{order.name}</p>
                      <p className="text-xs text-gray-500">+91 {order.phone}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.status === "PAID" && (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold">
                          <Package size={12} /> Ready to Ship
                        </span>
                      )}
                      {order.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold">
                          Pending Pay
                        </span>
                      )}
                      {order.status === "SHIPPED" && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold">
                          <Truck size={12} /> In Transit
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center gap-2 bg-[#5A2A2F] text-white px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest font-bold hover:bg-[#2d1b1b] transition-colors"
                      >
                        <Eye size={14} /> View & Dispatch
                      </Link>
                    </td>
                    
                  </tr>
                ))}

                {allOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No orders found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}