const mongoose = require('./mongoose'),
  Schema = mongoose.Schema;

const usersSchema = new Schema({

  githubId: Number,
  login: String,
  name: String,
  email: String,
  avatar_url: String,
  url: String,        // "https://api.github.com/users/octocat"
  html_url: String,   // "https://github.com/octocat",
  location: String,
  bio: String,
  public_repos: Number,
  public_gists: Number,
  accessToken: String,
  totalFiddles: Number,
  startedFiddles: [String], // We will store fiddle string here NOT objectID
});

usersSchema.statics.findOrCreate = function (profile, accessToken) {
  const Users = this;
  return Users.findOne({ githubId: profile.id }).then((user) => {
    if (user) {
      // TODO:Need to update accessToken for this user
      return Promise.resolve(user);
    }
    // Create new user
    const NewUser = new Users({
      githubId: profile.id,
      login: profile.login,
      name: profile.name,
      email: profile.email ? profile.email[0] : null,
      avatar_url: profile.avatar_url,
      url: profile.url,
      html_url: profile.html_url,
      location: profile.location,
      bio: profile.bio,
      public_repos: profile.public_repos,
      public_gists: profile.public_gists,
      accessToken,
    });

    return NewUser.save();
  }).catch(err => Promise.reject(err));
};

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;
