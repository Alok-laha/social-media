const { faker } = require('@faker-js/faker');
const db = require('./db');
const User = db.users;
// const Post = require('./models/Post'); // Your Post Mongoose Model
// const Follow = require('./models/Follow'); // Your Follow Mongoose Model
// const Like = require('./models/Like'); // Your Like Mongoose Model
// const Comment = require('./models/Comment'); // Your Comment Mongoose Model

async function generateUsers(count) {
    console.log(`Generating ${count} users...`);
    for (let i = 0; i < count; i++) {
        const user = new User({
            id: i+1,
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: '1234', // Use a consistent hashed password for dummy users
            profilePicture: faker.image.avatar(),
            bio: faker.lorem.sentence(),
            createdAt: faker.date.past({ years: 2 })
        });
        try {
            await user.save();
        } catch (error) {
            console.log(error.message);
        }
        if ((i + 1) % 10000 === 0) console.log(`  ${i + 1} users generated.`);
    }
    console.log('Users generation complete.');
}

async function generatePosts(userIds, postsPerUserMin, postsPerUserMax) {
    console.log(`Generating posts for ${userIds.length} users...`);
    let totalPosts = 0;
    for (const userId of userIds) {
        const numPosts = faker.number.int({ min: postsPerUserMin, max: postsPerUserMax });
        for (let i = 0; i < numPosts; i++) {
            const post = new Post({
                userId: userId,
                content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
                imageUrl: faker.helpers.arrayElement([faker.image.urlLoremFlickr({ category: 'nature' }), null]),
                createdAt: faker.date.recent({ days: 365 })
            });
            await post.save();
            totalPosts++;
        }
        if (totalPosts % 10000 === 0) console.log(`  ${totalPosts} posts generated.`);
    }
    console.log(`Posts generation complete: ${totalPosts} posts.`);
}

async function generateFollows(userIds, followRatio = 0.1) {
    console.log('Generating follows...');
    let totalFollows = 0;
    for (const followerId of userIds) {
        // Each user follows 'followRatio' % of other users, up to a reasonable limit
        const numToFollow = Math.min(faker.number.int({ min: 1, max: userIds.length * followRatio }), 200); // Max 200 follows
        const usersToFollow = faker.helpers.arrayElements(userIds.filter(id => id.toString() !== followerId.toString()), numToFollow);

        for (const followedId of usersToFollow) {
            const follow = new Follow({
                followerId: followerId,
                followedId: followedId,
                createdAt: faker.date.recent({ days: 365 })
            });
            await follow.save();
            totalFollows++;
        }
        if (totalFollows % 10000 === 0) console.log(`  ${totalFollows} follows generated.`);
    }
    console.log(`Follows generation complete: ${totalFollows} follows.`);
}

async function generateLikesAndComments(postIds, userIds, likeRatio = 0.5, commentRatio = 0.2) {
    console.log('Generating likes and comments...');
    let totalLikes = 0;
    let totalComments = 0;
    for (const postId of postIds) {
        const likers = faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: Math.ceil(userIds.length * likeRatio / 100) })); // Small percentage of users like a post
        for (const userId of likers) {
            const like = new Like({
                userId: userId,
                postId: postId,
                createdAt: faker.date.recent({ days: 300 })
            });
            await like.save();
            totalLikes++;
        }

        const commenters = faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: Math.ceil(userIds.length * commentRatio / 200) })); // Smaller percentage for comments
        for (const userId of commenters) {
            const comment = new Comment({
                userId: userId,
                postId: postId,
                content: faker.lorem.sentence(),
                createdAt: faker.date.recent({ days: 290 })
            });
            await comment.save();
            totalComments++;
        }

        if ((totalLikes + totalComments) % 10000 === 0) console.log(`  ${totalLikes} likes, ${totalComments} comments generated.`);
    }
    console.log(`Likes generation complete: ${totalLikes} likes.`);
    console.log(`Comments generation complete: ${totalComments} comments.`);
}


async function seedDatabase() {
    // Make sure your Mongoose models are defined and imported!
    // Example: User.js, Post.js, Follow.js, Like.js, Comment.js

    const NUM_USERS = 10000; // Start with 10k users, scale up to 100k, 1M+ later
    const POSTS_PER_USER_MIN = 5;
    const POSTS_PER_USER_MAX = 50;

    await generateUsers(NUM_USERS);

    // await generatePosts(userIds, POSTS_PER_USER_MIN, POSTS_PER_USER_MAX);
    // const postIds = (await Post.find({}, '_id').lean()).map(p => p._id);

    // await generateFollows(userIds, 0.05); // Each user follows 5% of others
    // await generateLikesAndComments(postIds, userIds, 0.5, 0.1); // 0.5% likes, 0.1% comments per post (relative to total users)

    console.log('Database seeding complete!');
}

module.exports = {seedDatabase}