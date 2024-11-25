import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoDatabase;

public class MongoDBDataStoreUtilities {
    private static final String MONGO_URI = "mongodb://localhost:27017";
    private static MongoClient mongoClient;
    private static MongoDatabase mongoDatabase;

    public static void initialize() {
        if (mongoClient == null) {
            mongoClient = new MongoClient(new MongoClientURI(MONGO_URI));
            mongoDatabase = mongoClient.getDatabase("smartnest");
        }
    }

    public static MongoDatabase getDatabase() {
        if (mongoDatabase == null) {
            initialize();
        }
        return mongoDatabase;
    }

    public static void close() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }
}
