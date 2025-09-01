import java.sql.*;

public class DatabaseMigration {
    public static void main(String[] args) {
        String url = "jdbc:h2:file:./data/fixpoint";
        String user = "sa";
        String password = "password";
        
        try {
            // Load H2 driver
            Class.forName("org.h2.Driver");
            
            // Connect to database
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to database successfully!");
            
            // Check current column definition
            String checkQuery = "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'REPORTS' AND COLUMN_NAME = 'DESCRIPTION'";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(checkQuery);
            
            System.out.println("Current column definition:");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("COLUMN_NAME"));
                System.out.println("Type: " + rs.getString("DATA_TYPE"));
                System.out.println("Max Length: " + rs.getString("CHARACTER_MAXIMUM_LENGTH"));
            }
            rs.close();
            
            // Alter the column
            String alterQuery = "ALTER TABLE REPORTS ALTER COLUMN DESCRIPTION SET DATA TYPE TEXT";
            stmt.executeUpdate(alterQuery);
            System.out.println("Column altered successfully!");
            
            // Verify the change
            rs = stmt.executeQuery(checkQuery);
            System.out.println("\nNew column definition:");
            while (rs.next()) {
                System.out.println("Column: " + rs.getString("COLUMN_NAME"));
                System.out.println("Type: " + rs.getString("DATA_TYPE"));
                System.out.println("Max Length: " + rs.getString("CHARACTER_MAXIMUM_LENGTH"));
            }
            rs.close();
            
            stmt.close();
            conn.close();
            System.out.println("\nMigration completed successfully!");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
