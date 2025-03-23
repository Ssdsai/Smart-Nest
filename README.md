## Smart-Nest

Built a Smart Home product management application, the frontend with React and implemented backend functionality using Java Servlets to enable efficient CRUD operations and product catalog management.
•
Managed MySQL and MongoDB databases, integrated Elasticsearch for enhanced search with semantic search embeddings, and Leveraged the Open AI API for LLM-, Designed a multi-role system (Customers, Store Managers, Salesmen) with authentication and order tracking.

## Frontend App Server

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Apache TomCat Server is Required

### `mvn clean package`

Creates the WAR File to deploy
Later you may deploy the WAR file in http://localhost:8080


1. Run the React Server First - npm start
2. Run your Apache TomCat server
3. Then deploy the war file
4. Connect to the MySQLDatabase and MongoDatabase change the credentials as needed
5. Install Docker then Create a Elastic Search Container and note down the Elastic Search password
6. You need to give your elastic search username and password also openapi key.
7. Now Install OpenAI, Flask
8. You can later check the recommend and review features.
