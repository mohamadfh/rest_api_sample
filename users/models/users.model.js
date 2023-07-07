const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    permissionLevel: Number,
    friends: [{ type: Schema.Types.ObjectId, ref: 'Users' }]

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);


exports.findByEmail = (email) => {
    return User.find({email: email});
};
exports.findById = (id,showfriends) => {
    return User.findById(id).populate('friends')
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            if(showfriends !== 'true'){
                delete result.friends;
            }
            return result;
        });
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.list = (perPage, page,showfriends) => {
    return new Promise((resolve, reject) => {
        User.find().populate('friends')
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {

                    if(showfriends !== 'true') {
                        users.forEach(function(v){
                            v.friends = undefined;
                            });
                    }
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return User.findOneAndUpdate({
        _id: id
    }, userData);
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.deleteMany({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

exports.addFriend = (userId, friendId) => {
    return User.findByIdAndUpdate(
        userId,
        { $push: { friends: friendId } },
    );
};
exports.removeFriend =  (userId, friendId) => {
    return User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
    );
};
