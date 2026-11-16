# Screen Map - The Corner Kitchen
I used this map to show where each person goes after signing in.
## Customer
Sign in / Sign up -> Menu -> Cart -> Simulated card payment -> Order status
Menu -> My orders -> Order status
Forgot password -> Reset password -> Sign in
## Cashier
Sign in -> Sales (walk-in register) -> Orders board
## Manager
Sign in -> Sales report
Sales report -> Sales / Orders board / Menu items / Inventory / Staff
## Notes
- Customers can only see their own orders.
- Staff pages need staff access. Staff and Sales report are manager-only screens.
- Order states are placed, preparing, ready and completed. Completed is shown as Picked up.
- The server checks roles, prices, totals and stock.
- Staff can cancel an order. Customers call the restaurant to request a cancellation.
## Page states
- Menu: show Loading menu while waiting. If it fails, show a message and Try again. Sold-out items cannot be added.
- Cart: show Your cart is empty with Back to menu. Quantities must be positive whole numbers.
- Checkout: if payment fails, show a message and keep the cart. Show the saved order after the server confirms it.
- Sign up: show missing fields, invalid email, passwords that do not match, or an email already in use.
- Reset password: show an invalid or expired link with a way to request another link.
- My orders: show No orders yet when empty. Customers can only open their own orders.
- Orders board: show No orders when empty and a message if an update fails.
- Menu items, Inventory and Staff: show invalid input beside the field and confirm a successful save.
- Sales report: show zero totals for a day with no sales and a message if the report cannot load.
## Design files
- Restaurant_Mockups_Print.pdf: original customer and staff designs.
- Additional_Screen_Wireframes.pdf: Sign up, Reset password, My orders and simulated payment.
- Restaurant_Project_Plan_v8.pdf: existing project plan, database schema and API routes.
## Build notes
These are designs for the full app, not finished pages. I will use HTML, CSS and JavaScript for my pages.
The original mockups also show extra features. GitHub milestones decide when we build them. Printed receipts, drag to reorder, cancel history and discounts stay in Future for now. The first sales report only needs basic daily totals. Charts and profit details can wait.
