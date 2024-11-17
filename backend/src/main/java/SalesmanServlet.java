import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/salesman/*")
public class SalesmanServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getPathInfo();

        try (Connection connection = MySQLDataStoreUtilities.getConnection()) {
            if (action == null || action.equals("/")) {
                // Fetch all orders
                List<Order> orders = getAllOrders(connection);
                response.setContentType("application/json");
                PrintWriter out = response.getWriter();
                out.print(new Gson().toJson(orders));
                out.flush();
            } else {
                // Fetch specific order
                String orderId = action.substring(1);
                Order order = getOrder(connection, orderId);
                if (order != null) {
                    response.setContentType("application/json");
                    PrintWriter out = response.getWriter();
                    out.print(new Gson().toJson(order));
                    out.flush();
                } else {
                    response.sendError(HttpServletResponse.SC_NOT_FOUND, "Order not found");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    @Override
protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String orderId = request.getPathInfo();
    if (orderId != null && orderId.length() > 1) {
        orderId = orderId.substring(1); // Remove leading '/'
    } else {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing order ID");
        return;
    }

    
    // Read the request body
    BufferedReader reader = request.getReader();
    Order updatedOrder = new Gson().fromJson(reader, Order.class);
    
    // Log the order being updated
    System.out.println("Updating order ID: " + orderId + " with data: " + updatedOrder);

    try (Connection connection = MySQLDataStoreUtilities.getConnection()) {
        updateOrder(connection, orderId, updatedOrder);
        response.setStatus(HttpServletResponse.SC_OK);
    } catch (SQLException e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error updating order: " + e.getMessage());
    }
}


    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String orderId = request.getPathInfo().substring(1);
        try (Connection connection = MySQLDataStoreUtilities.getConnection()) {
            deleteOrder(connection, orderId);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (SQLException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    private List<Order> getAllOrders(Connection connection) throws SQLException {
        List<Order> orders = new ArrayList<>();
        String query = "SELECT * FROM Orders";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                orders.add(new Order(
                    rs.getString("order_id"),
                    rs.getString("customer_name"),
                    rs.getString("customer_address")
                ));
            }
        }
        return orders;
    }

    private Order getOrder(Connection connection, String orderId) throws SQLException {
        String query = "SELECT * FROM Orders WHERE order_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, orderId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return new Order(
                        rs.getString("order_id"),
                        rs.getString("customer_name"),
                        rs.getString("customer_address")
                    );
                }
            }
        }
        return null; // Handle order not found
    }

    private void updateOrder(Connection connection, String orderId, Order updatedOrder) throws SQLException {
        String query = "UPDATE Orders SET customer_name = ?, customer_address = ? WHERE order_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, updatedOrder.getCustomerName());
            pstmt.setString(2, updatedOrder.getCustomerAddress());
            pstmt.setString(3, orderId);
            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new SQLException("No order found with the specified ID.");
            }
        }
    }

    private void deleteOrder(Connection connection, String orderId) throws SQLException {
        String query = "DELETE FROM Orders WHERE order_id = ?";
        try (PreparedStatement pstmt = connection.prepareStatement(query)) {
            pstmt.setString(1, orderId);
            pstmt.executeUpdate();
        }
    }

    // Order class (inner class for simplicity)
    private class Order {
        private String orderId;
        private String customerName;
        private String customerAddress;

        public Order(String orderId, String customerName, String customerAddress) {
            this.orderId = orderId;
            this.customerName = customerName;
            this.customerAddress = customerAddress;
        }

        public String getOrderId() {
            return orderId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public String getCustomerAddress() {
            return customerAddress;
        }
    }
}
