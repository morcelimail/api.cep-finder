# api.cep-finder
CEP Finder API using Node.js, Redis and MongoDB.

#How to set up
- Install Node.js (6.x or higher)  https://nodejs.org/en/download/
- Install MongoDB https://docs.mongodb.com/getting-started/shell/installation/
- Install Redis https://redis.io/download
- Install the Node.js dependencies.
```
npm install
```
- Populate MongoDB
```
npm run populate
```
- Run the Project
```
npm start
```
- Open your web browser on: http://localhost:3000/api/debug
- Enjoy ;)

#More
- Generating documentation
```
npm run doc
```
The folder <path_to_project>/out will be generated.

#Used technologies:
-Node.JS
-MongoDB
-Redis

#Why Node.JS?
Node.js is a growing technology with fast results and low learning curve.

#Why MongoDB?
How we talking about big data amounts, is very important to choose a robust database with low latency and flexibility so, this way, MongoDB do the job very well.

#Why Redis?
Actually was my choice use cache in this project. Even using MongoDB as NoSQL database he could be a problem in the future because of your disk usage. So is necessary to use an in-memory database to reduce disk latency.

#How the Project works?
When a search is made, the system use a priority order to find the data. The order is Cache, MongoDB and finally Webservices. Always using the option with lesser resources amount. When a CEP is found at a below layer the system automatically updates the above layers normalizing the data.

Let's suppose that a search by CEP was made. The system will check in the cache. Ok not found, let's jump to the next layer MongoDB. Not found too, and now we'll find on Webservices. Finally! the CEP was found! Now the system will start to update the MongoDB layer (add new registry) when finish will start to update the Cache layer. after this, the server will return the search result to the user. The next time that the same CEP was searched the system will find the result on the cache and will return the data faster.

#Strong points

-Scalability - This model was made based that the system probably will be distributed with variable size. So he's divided into three parts: the system itself, memory cache and persistence. Everyone can be used with clusters or load balances without big effort.
-Easy to change/create - The server uses Javascript and this way is easy to teach or find collaborators.
-Very active web community - Is easy find good stuff about it and also, this shows that the technology will be kept during the lifecycle system.

#Weak points
-Node.JS offers only 1400MB of memory for every process. So if something is too big (greater than 1.4GB) Is necessary to use another technology like C++, Python or even GO. But this is a problem that happens very rarely in web APIs.
-Hard to do the developer to follow the directives once that we're using Javascript. JS might be the good or bad guy, depending on the developer.
-Could be hard to track a bug once that the system involves a big number of endpoints to make a search.


#Contact Info.
This project was made by Bruno Morceli.
- Email: morcelimail@gmail.com, pirofagista@gmail.com
- Skype: bruno.morceli
