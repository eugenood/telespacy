const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

class DataStore {

  constructor(directory) {
    const adapter = new FileSync(directory);
    this.db = lowdb(adapter);
    this.db.defaults({ spaces: [], groups: [] }).write();
  }

  createSpace(spacename, moderatorId, baseId, baseTitle, baseLink) {
    const base = { id: baseId, title: baseTitle, link: baseLink, spacename };
    const space = { spacename, base, groups: [], moderators: [{ id: moderatorId }] };
    this.db.get("groups").push(base).write();
    this.db.get("spaces").push(space).write();
  }

  getSpace(spacename) {
    return this.db.get("spaces").find({ spacename }).value();
  }
  
  spaceExist(spacename) {
    return this.db.get("spaces").find({ spacename }).size() > 0;
  }

  addGroup(spacename, groupId, groupTitle, groupLink) {
    const group = { id: groupId, title: groupTitle, link: groupLink, spacename };
    this.db.get("groups").push(group).write();
    this.db.get("spaces").find({ spacename }).get("groups").push(group).write();
  }

  getGroup(groupId) {
    return this.db.get("groups").find({ id: groupId }).value();
  }
  
  groupExist(groupId) {
    return this.db.get("groups").find({ id: groupId }).size() > 0;
  }

  addModerator(spacename, moderatorId) {
    this.db.get("spaces").find({ spacename }).get("moderators").push({ id: moderatorId }).write();
  }

  isModerator(spacename, userId) {
    return this.db.get("spaces").find({ spacename }).get("moderators").find({ id: userId }).size() > 0;
  }

}

module.exports = DataStore;
