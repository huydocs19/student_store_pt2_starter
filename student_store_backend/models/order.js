const db = require("../db")
const { BadRequestError} = require("../utils/errors")

class Order {
  static async listOrdersForUser(user) {
    // return all orders that the authenticated user has created
    const result = await db.query(`
      SELECT o.id AS "orderId", o.customer_id AS "customerId", 
             od.quantity AS quantity, p.name AS name, p.price AS price             
      FROM orders AS o
      JOIN order_details AS od ON o.id = od.order_id
      JOIN products AS p ON p.id = od.product_id
      WHERE o.customer_id = (
        SELECT id FROM users WHERE email = $1
      )
    `, [user.email])    
    return result.rows
    
  }
  static async createOrder(user, orderList) {
    // take a user's order and store it in the database       
    if (!orderList.hasOwnProperty("order")) {
      throw new BadRequestError(`Invalid order in request body.`)
    }
    
    const result = await db.query(
      `INSERT INTO orders (customer_id)
       VALUES ((SELECT id FROM users WHERE email = $1))
       RETURNING id AS "orderId";
      `,
      [user.email]
    )  
    const orderId = result.rows[0].orderId 
    for (const [productId, quantity] of Object.entries(orderList.order)) {
      await db.query(
        `INSERT INTO order_details (order_id, product_id, quantity)
         VALUES ($1, $2, $3)         
        `,
        [orderId, productId, quantity]
      )
    }
    const orders = await this.listOrdersForUser(user)
    return orders
    
  }
}

module.exports = Order
