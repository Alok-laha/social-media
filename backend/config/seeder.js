const { faker } = require('@faker-js/faker');
const {getShard} = require('./shardMiddleware');
const shardModels = require('./shardModels');

async function generateUsers(count) {
    console.log(`Generating ${count} users...`);
    for (let i = 0; i < count; i++) {
        let instance = getShard(i+1);
        const user = new instance.User({
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
        let instance = getShard(userId);
        for (let i = 0; i < numPosts; i++) {
            const post = new instance.Post({
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
        let instance = getShard(followerId);

        for (const followedId of usersToFollow) {
            const follow = new instance.Follow({
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
            let instance = getShard(userId);
            const like = new instance.Like({
                userId: userId,
                postId: postId,
                createdAt: faker.date.recent({ days: 300 })
            });
            await like.save();
            totalLikes++;
        }

        const commenters = faker.helpers.arrayElements(userIds, faker.number.int({ min: 0, max: Math.ceil(userIds.length * commentRatio / 200) })); // Smaller percentage for comments
        for (const userId of commenters) {
            let instance = getShard(userId);
            const comment = new instance.Comment({
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

    async function getAllUsers() {
      const results = await Promise.all(
        shardModels.map(async ({ User }) => {
          return await User.findAll();
        })
      );

      // Flatten the array of arrays
      const allUsers = results.flat();
      return allUsers;
    }
    console.time("Users fetch");
    const userIds = (await getAllUsers()).map(u => u.id);
    console.timeEnd("Users fetch");

    if(userIds.length === 0){
        await generateUsers(NUM_USERS);
    }

    await generatePosts(userIds, POSTS_PER_USER_MIN, POSTS_PER_USER_MAX);
    async function getAllPosts() {
      const results = await Promise.all(
        shardModels.map(async ({ Post }) => {
          return await Post.findAll();
        })
      );

      // Flatten the array of arrays
      const allPosts = results.flat();
      return allPosts;
    }

    const postIds = (await getAllPosts()).map(p => p.id);

    await generateFollows(userIds, 0.05); // Each user follows 5% of others
    await generateLikesAndComments(postIds, userIds, 0.5, 0.1); // 0.5% likes, 0.1% comments per post (relative to total users)

    console.log('Database seeding complete!');
}

module.exports = {seedDatabase}