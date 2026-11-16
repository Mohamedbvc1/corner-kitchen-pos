# Screen Map - The Corner Kitchen

## Customer

- Sign in / Sign up -> Menu -> Cart -> Simulated card payment -> Order status
- Menu -> My orders -> Order status
- Forgot password -> Reset password -> Sign in

## Cashier

Sign in -> Sales (walk-in register) -> Orders board

## Manager

- Sign in -> Sales report
- Sales report -> Sales / Orders board / Menu items / Inventory / Staff

## Notes

- Customers only see their own orders.
- Staff pages require staff access. Staff and Sales report are manager-only.
- Order status: placed, preparing, ready, completed. Completed appears as Picked up.
- The server checks roles, prices, totals and stock.
- Customers call the restaurant to request a cancellation. Staff handle it.

## Page states

- Menu: loading message, Try again on error, and no adding sold-out items.
- Cart: empty-cart message, Back to menu, and positive whole-number quantities.
- Checkout: keep the cart if payment fails. Show the order after the server confirms it.
- Sign up: check required fields, email, matching passwords and duplicate accounts.
- Reset password: show an error for an invalid or expired link and offer a new link.
- My orders: No orders yet when empty.
- Orders board: No orders when empty and an error if an update fails.
- Menu items, Inventory and Staff: input errors and a message after saving.
- Sales report: zero totals for no sales and an error if loading fails.

## Files

- [Screen designs](Restaurant_Mockups_Print.pdf)
- [Sign up, reset password, My orders and payment](Additional_Screen_Wireframes.pdf)
- [Project plan](Restaurant_Project_Plan_v8.pdf)

## Later features

Follow the GitHub milestones. Receipts, drag to reorder, cancel history and discounts are in Future. Start with basic daily sales totals; charts and profit details come later.
