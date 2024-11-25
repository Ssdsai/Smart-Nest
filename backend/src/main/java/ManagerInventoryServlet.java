import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.Gson;

@WebServlet("/fetchProducts")
public class ManagerInventoryServlet extends HttpServlet {

    // Method to fetch product data
    public List<ManagerInventoryProduct> fetchProducts() {
        List<ManagerInventoryProduct> productList = new ArrayList<>();
        Connection conn = MySQLDataStoreUtilities.getConnection();
        
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT product_name, price, product_sales, onsale, rebate FROM Products");

            while (rs.next()) {
                String productName = rs.getString("product_name");
                double price = rs.getDouble("price");
                int productSales = rs.getInt("product_sales");
                String onSale = rs.getString("onsale");
                double rebate = rs.getDouble("rebate");

                productList.add(new ManagerInventoryProduct(productName, price, productSales, onSale, rebate));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            MySQLDataStoreUtilities.closeConnection(conn);
        }

        return productList;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        List<ManagerInventoryProduct> products = fetchProducts();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        Gson gson = new Gson();
        String json = gson.toJson(products);
        response.getWriter().write(json);
    }
    
    public static void main(String[] args) {
        ManagerInventoryServlet inventoryReport = new ManagerInventoryServlet();
        List<ManagerInventoryProduct> products = inventoryReport.fetchProducts();
        
        // Display the inventory report
        System.out.println("Inventory Report:");
        System.out.println("Product Name\tPrice\tAvailable Items\tSales");
        for (ManagerInventoryProduct product : products) {
            System.out.printf("%s\t%.2f\t%d\t%d\n", 
                product.getProductName(), 
                product.getPrice(), 
                product.getAvailableItems(), 
                product.getProductSales());
        }
    }
}

class ManagerInventoryProduct {
    private String productName;
    private double price;
    private int productSales;
    private String onSale;
    private double rebate;
    private int availableItems;

    public ManagerInventoryProduct(String productName, double price, int productSales, String onSale, double rebate) {
        this.productName = productName;
        this.price = price;
        this.productSales = productSales;
        this.onSale = onSale;
        this.rebate = rebate;

        // Generate random available items (minimum 50)
        Random rand = new Random();
        this.availableItems = rand.nextInt(100) + 50; // Generates a number between 50 and 149
    }

    // Getters for the fields
    public String getProductName() { return productName; }
    public double getPrice() { return price; }
    public int getProductSales() { return productSales; }
    public String getOnSale() { return onSale; }
    public double getRebate() { return rebate; }
    public int getAvailableItems() { return availableItems; }
}
