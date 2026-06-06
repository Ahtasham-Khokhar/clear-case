// import type React from "react"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/admin/app-sidebar"
// import { Toaster } from "@/components/ui/toaster"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Police Management System",
//   description: "Admin dashboard for police management system",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <SidebarProvider>
//           <AppSidebar />
//           <main className="flex-1">
//             <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//               <div className="flex h-14 items-center px-4">
//                 <SidebarTrigger />
//                 <div className="ml-4">
//                   <h1 className="text-lg font-semibold">Police Management System</h1>
//                 </div>
//               </div>
//             </div>
//             <div className="flex-1 space-y-4 p-4 md:p-8">{children}</div>
//           </main>
//         </SidebarProvider>
//         <Toaster />
//       </body>
//     </html>
//   )
// }
