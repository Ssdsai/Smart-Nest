import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySQLDataStoreUtilities {
    private static final String URL = "jdbc:mysql://localhost:3306/SmartNest";  // Database name is SmartNest
    private static final String USERNAME = "root";
    private static final String PASSWORD = "Localhost@80";

    public static Connection getConnection() {
        Connection conn = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
            if (conn != null) {
                System.out.println("Connected to the SmartNest database successfully.");
            }
        } catch (ClassNotFoundException e) {
            System.err.println("JDBC Driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("SQL Exception while establishing connection: " + e.getMessage());
        }
        return conn;
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("Error closing connection: " + e.getMessage());
            }
        }
    }
}
