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

@WebServlet("/fetchDailySalesData") // Ensure this mapping is correct
public class ManagerDailySalesReport extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Method to fetch total daily sales data from Orders
    private List<DailySales> fetchDailySalesData() {
        List<DailySales> dailySalesList = new ArrayList<>();
        Connection conn = MySQLDataStoreUtilities.getConnection();

        try {
            Statement stmt = conn.createStatement();
            // Updated query to include total_sales for each unique purchase date
            ResultSet rs = stmt.executeQuery("SELECT DATE(purchase_date) AS purchase_date, SUM(total_sales) AS total_sales " +
                                               "FROM Orders " +
                                               "GROUP BY DATE(purchase_date)");

            while (rs.next()) {
                String purchaseDate = rs.getString("purchase_date");
                double totalSales = rs.getDouble("total_sales");
                dailySalesList.add(new DailySales(purchaseDate, totalSales));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        return dailySalesList;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        System.out.println("Received request for daily sales data");
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins, or specify a domain
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

        List<DailySales> dailySalesData = fetchDailySalesData();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Gson gson = new Gson();
        String jsonDailySalesData = gson.toJson(dailySalesData);
        response.getWriter().write(jsonDailySalesData);
    }
}

// Class to represent daily sales data
class DailySales {
    private String purchase_date;
    private double total_sales;

    public DailySales(String purchase_date, double total_sales) {
        this.purchase_date = purchase_date;
        this.total_sales = total_sales;
    }

    public String getPurchase_date() {
        return purchase_date;
    }

    public double getTotal_sales() {
        return total_sales;
    }
}
