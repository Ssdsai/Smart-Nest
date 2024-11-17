import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/fetchSalesData")  // Ensure this mapping is correct
public class ManagerSalesReport extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Method to fetch sales data from Products
    private List<SaleProduct> fetchSalesData() {
        List<SaleProduct> salesList = new ArrayList<>();
        Connection conn = MySQLDataStoreUtilities.getConnection();

        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT product_name, price, product_sales FROM Products");

            while (rs.next()) {
                String productName = rs.getString("product_name");
                double price = rs.getDouble("price");
                int quantitySold = rs.getInt("product_sales");
                salesList.add(new SaleProduct(productName, price, quantitySold));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        return salesList;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, or specify a domain
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

        List<SaleProduct> salesData = fetchSalesData();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Gson gson = new Gson();
        String jsonSalesData = gson.toJson(salesData);
        response.getWriter().write(jsonSalesData);
    }
}

// Class to represent product sales data
class SaleProduct {
    private String product_name;
    private double price;
    private int product_sales;

    public SaleProduct(String product_name, double price, int product_sales) {
        this.product_name = product_name;
        this.price = price;
        this.product_sales = product_sales;
    }

    public String getProduct_name() {
        return product_name;
    }

    public double getPrice() {
        return price;
    }

    public int getProduct_sales() {
        return product_sales;
    }
}
