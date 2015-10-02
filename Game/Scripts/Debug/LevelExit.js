////
//  CLASS: LevelExit
//  Used in the boss room to take the player to the next level
////

function LevelExit(x, y)
{
    this.sprite = groupLevelEntities.create(x, y, 'levelexit');
    this.sprite.object = this;
}
