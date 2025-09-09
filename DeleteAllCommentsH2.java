import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DeleteAllCommentsH2 {
    public static void main(String[] args) {
        String url = "jdbc:h2:./data/fixpoint"; // Update path if needed
        String user = "sa";
        String password = "";
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            int deleted = stmt.executeUpdate("DELETE FROM comments;");
            System.out.println("Deleted " + deleted + " comments from the database.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
