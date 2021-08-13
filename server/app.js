const {MongoClient} = require('mongodb');

async function main(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    // const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority";
    const uri = "mongodb+srv://crud:karthi%4097@cluster0.qmh0y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
 

    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        console.log("Database connected successfully");


        //add one
        // await createListing(client,
        //     {
        //         name: "Lovely Loft",
        //         summary: "A charming loft in Paris",
        //         bedrooms: 1,
        //         bathrooms: 1
        //     }
        // );


        //add multiple
        // await createMultipleListings(client, [
        //     {
        //         name: "Infinite Views",
        //         summary: "Modern home with infinite views from the infinity pool",
        //         property_type: "House",
        //         bedrooms: 5,
        //         bathrooms: 4.5,
        //         beds: 5
        //     },
        //     {
        //         name: "Private room in London",
        //         property_type: "Apartment",
        //         bedrooms: 1,
        //         bathroom: 1
        //     }
        // ]);


        // readbyone
        // await findOneListingByName(client, "Infinite Views");

        // readall
        // await findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // });



        // updateone
        // await findOneListingByName(client, "Infinite Views");
        // await updateListingByName(client, "Infinite Views", {bedrooms: 6, bed: 8});
        // await findOneListingByName(client, "Infinite Views");
        
        // upsert
        // await findOneListingByName(client, "cozy cottage");
        // await upsertListingByName(client, "cozy cottage", {beds: 2});

        // updateAll
        // await updateAllListingsToHavePropertyType(client);

        

        // deleteone
        // await deleteListingByName(client, "cozy cottage");

        // deleteall
        await deleteListingsScrapedBeforeDate(client, new Date("2020-10-11"));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteMany({"last_scrapped": {$lt: date}});
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .deleteOne({name: nameOfListing});
    console.log(`${result.deletedCount} document(s) was/were deleted`);
}

async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
        .updateMany({ property_type: {$exists: false}},
            {$set: {property_type: "Unknown"}});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews")
                        .updateOne({ name: nameOfListing },
                                   { $set: updatedListing },
                                   { upsert: true });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

async function updateListingByName(client, nameOfListing, updateListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne(
        { name: nameOfListing },
        { $set: updateListing }
    );

    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated`);
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberofResults = Number.MAX_SAFE_INTEGER
} ={}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find(
        {
            bedrooms: {$gte: minimumNumberOfBathrooms},
            bathrooms: {$gte: minimumNumberOfBathrooms}
        }
        ).sort({ last_reviews: -1 })
        .limit(maximumNumberofResults);

    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}
 

async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing});
    if(result) {
        console.log(`Found a listing in the collection with the '${nameOfListing}':`);
        console.log(result);
    }  else {
        console.log(`No listings found with the name '${nameOfListing}':`);
    }
}

async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds);
}

async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the fallowing id: ${result.insertedId}`);
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(`-${db.name}`));
}