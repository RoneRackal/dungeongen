function Door(direction, position, lock)
{
    this.direction = direction;
    this.position = position;
    this.open = true;
    this.lock = lock || null;
}

Door.prototype.Init = function (roomX, roomY)
{
    // TODO: Add logic for creating coloured lock sprite
    
    
    // This is used to create blocks on the solidMap
    var returnPos;
    
    // Figure out the coords for door sprites
    if (this.direction == 'n')
    {
        this.x = roomX + gameManager.tileSize * this.position;
        this.y = roomY;
        this.height = gameManager.tileSize;
        this.width = gameManager.tileSize * 2;
        returnPos = { x: this.position, y: 0 };
    }
    else if (this.direction == 'e')
    {
        this.x = roomX + gameManager.tileSize * (gameManager.roomSize -1);
        this.y = roomY + gameManager.tileSize * this.position;
        this.height = gameManager.tileSize * 2;
        this.width = gameManager.tileSize;
        returnPos = { x: gameManager.roomSize - 1, y: this.position };
    }
    else if (this.direction == 's')
    {
        this.x = roomX + gameManager.tileSize * this.position;
        this.y = roomY + gameManager.tileSize * (gameManager.roomSize -1);
        this.height = gameManager.tileSize;
        this.width = gameManager.tileSize * 2;
        returnPos = { x: this.position, y: gameManager.roomSize - 1 };
    }
    else if (this.direction == 'w')
    {
        this.x = roomX;
        this.y = roomY + gameManager.tileSize * this.position;
        this.height = gameManager.tileSize * 2;
        this.width = gameManager.tileSize;
        returnPos = { x: 0, y: this.position };
    }
    
    this.spriteClosedDoor = groupDungeon.create(this.x, this.y, 'door_' + this.direction);
    
    this.spriteOpenDoor = groupDungeonOverhead.create(this.x, this.y, 'door_' + this.direction + '_open');
    
    this.spriteBlock = groupUnderBlockLayer.create(this.x, this.y, 'block64');
    this.spriteBlock.body.immovable = true;
    this.spriteBlock.object = this;
    
    if (this.lock)
    {
        this.lockParticles = groupDungeonOverhead.add(new Phaser.Group(game, groupDungeonOverhead));
        this.lockParticles.createMultiple(10, 'sparkle');
        this.lockParticles.setAll('anchor.x', 0.5);
        this.lockParticles.setAll('anchor.y', 0.5);
        this.lockParticles.setAll('scale.x', 0.5);
        this.lockParticles.setAll('scale.y', 0.5);
        this.lockParticles.setAll('tint', this.lock);
        this.lockParticles.callAll('animations.add', 'animations', 'go', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 10, false);

        this.particleSpawnTimer = game.time.now;
        this.particleSpawnRate = 300; // Milliseconds for next particle spawn
    }
    
    this.Open();
    
    return returnPos;
}

Door.prototype.Update = function ()
{
    if (this.lockParticles && this.lock)
    {
        if (game.time.now >= this.particleSpawnTimer)
        {
            this.particleSpawnTimer = game.time.now + this.particleSpawnRate;
            var particle = this.lockParticles.getFirstDead();
            particle.reset(this.x +Utility.Random(0, gameManager.tileSize), this.y +Utility.Random(0, gameManager.tileSize));
            particle.animations.play('go', 10, false, true);
        }
    }
}

// Opens the door, if door is also unlocked it will delete the blocking object and change the sprite
Door.prototype.Open = function ()
{
    this.open = true;
    if (this.lock == null)
    {
        this.spriteClosedDoor.visible = false;
        this.spriteOpenDoor.visible = true;
        this.spriteBlock.exists = false;
    }
}

// Closes the door, this creates the blocking object if it doesn't already exist and changes the sprite
Door.prototype.Close = function ()
{
    this.open = false;
    this.spriteClosedDoor.visible = true;
    this.spriteOpenDoor.visible = false;
    this.spriteBlock.exists = true;
}

Door.prototype.Unlock = function ()
{
    this.lock = null;
    
    if (this.open)
    {
        this.spriteClosedDoor.visible = false;
        this.spriteOpenDoor.visible = true;
        this.spriteBlock.exists = false;
    }
}

function Room(x, y)
{
    this.positionInDungeon = new Vector(x, y);
    this.doors = [];
    this.keys = [];
    this.startRoom = false;
    this.bossRoom = false;
    this.puzzleRoom = false;
    this.hasMonsters = false;
    this.monsterLevel = 0;
    this.explored = false;
    this.monsters = [];
    this.solidMap = CreateMatrix(gameManager.roomSize * 2, gameManager.roomSize * 2, 0);
    
    this.roomX = this.positionInDungeon.x * gameManager.roomSize * gameManager.tileSize;
    this.roomY = this.positionInDungeon.y * gameManager.roomSize * gameManager.tileSize;
}

Room.prototype.AddKey = function (colour)
{
    this.keys.push(colour);
}

Room.prototype.SetMonsters = function (monsterlevel)
{
    this.hasMonsters = true;
    this.monsterLevel = monsterlevel;
}

Room.prototype.SetPuzzle = function ()
{
    this.puzzleRoom = true;
}

Room.prototype.AddLock = function (doorNum, lock)
{
    this.doors[doorNum].lock = lock;
}

/**
 * Returns the number of the door added
 */
Room.prototype.AddDoor = function (direction, position, lock)
{
    var door = new Door(direction, position, lock);
    this.doors.push(door);
    
    return this.doors.length - 1;
}

Room.prototype.DoorAtPosition = function (direction, position)
{
    for (var i = 0; i < this.doors.length; i++)
    {
        if (this.doors[i].direction == direction && this.doors[i].position == position)
        {
            return true;
        }
    }
    
    return false;
}

Room.prototype.RegisterMonster = function (monster)
{
    this.monsters.push(monster);
}

Room.prototype.CheckWinConditions = function ()
{
    if (this.hasMonsters)
    {
        var aliveMonsters = 0;
        
        for (var i = 0; i < this.monsters.length; i++)
        {
            if (this.monsters[i].sprite != null && this.monsters[i].sprite.alive == true)
            {
                aliveMonsters++;
            }
        }
        
        console.log("ALIVE MONSTERS: " + aliveMonsters);
        
        // Open doors if monsters are all dead
        if (aliveMonsters == 0)
        {
            for (var i = 0; i < this.doors.length; i++)
            {
                this.doors[i].Open();
            }
            this.monsters.empty();
        }
    }
}

Room.prototype.RoomEntered = function ()
{
    if (this.explored)
        return;
        
    this.explored = true;
    
    if (this.hasMonsters)
    {
        var amountOfMonsters = Utility.RandomInt(1, 3);

        for (var i = 0; i < amountOfMonsters; i++)
        {
            var xPos = this.positionInDungeon.x * gameManager.roomSize * gameManager.tileSize + gameManager.tileSize + Utility.Random((gameManager.roomSize - 2) * gameManager.tileSize);
            var yPos = this.positionInDungeon.y * gameManager.roomSize * gameManager.tileSize + gameManager.tileSize + Utility.Random((gameManager.roomSize - 2) * gameManager.tileSize);
            new Slime(xPos, yPos, this);
        }

        if (Utility.Random(100) < 50)
        {
            var amountOfBats = Utility.RandomInt(3, 7);

            for (var i = 0; i < amountOfBats; i++)
            {
                var xPos = this.positionInDungeon.x * gameManager.roomSize * gameManager.tileSize + gameManager.tileSize + Utility.Random((gameManager.roomSize - 2) * gameManager.tileSize);
                var yPos = this.positionInDungeon.y * gameManager.roomSize * gameManager.tileSize + gameManager.tileSize + Utility.Random((gameManager.roomSize - 2) * gameManager.tileSize);
                new Bat(xPos, yPos, this);
            }
        }
        
        // Close doors to lock player in
        for (var i = 0; i < this.doors.length; i++)
        {
            this.doors[i].Close();
        }
    }
    
    easystar.setGrid(this.solidMap);
}

Room.prototype.ActivateMonsters = function ()
{
    for (var i = 0; i < this.monsters.length; i++)
    {
        this.monsters[i].Activate();
    }
}

Room.prototype.SetRoomAsStart = function ()
{
    this.startRoom = true;
}

Room.prototype.SetRoomAsBoss = function ()
{
    this.bossRoom = true;
}

Room.prototype.CreateFloor = function ()
{
    var floorTiles = gameManager.roomSize * 2;
    var m = new Matrix(floorTiles, floorTiles, 0);
    var amountOfBlobs = Utility.RandomInt(1, 10);
    
    // Matrix of floor tiles to generate.
    // 0. Normal floor
    // 1. Ligther floor
    // 2. Bones
    
    // Lighter ground blobs
    for (var blob = 0; blob < amountOfBlobs; blob++)
    {
        var blobWidth = Utility.RandomInt(2, 5);
        var blobHeight = Utility.RandomInt(2, 5);
        
        var blobX = Utility.RandomInt(floorTiles - blobWidth);
        var blobY = Utility.RandomInt(floorTiles - blobHeight);
        
        for (var i = blobX; i < blobX + blobWidth; i++)
        {
            for (var j = blobY; j < blobY + blobHeight; j++)
            {
                m.Set(i, j, 1);
            }
        }
    }
    
    // Add in bones and other debris
    var bones = Utility.RandomInt(5);
    for (var i = 0; i < bones;)
    {
        var boneX = Utility.RandomInt(floorTiles);
        var boneY = Utility.RandomInt(floorTiles);
        
        var c = m.Get(boneX, boneY);
        
        // If all surrounding tiles are the same, we can add bones
        if ((m.GetOrDefault(boneX + 1, boneY + 1, 999) == c) &&
            (m.GetOrDefault(boneX + 1, boneY - 1, 999) == c) &&
            (m.GetOrDefault(boneX + 1, boneY, 999) == c) &&
            (m.GetOrDefault(boneX - 1, boneY + 1, 999) == c) &&
            (m.GetOrDefault(boneX - 1, boneY - 1, 999) == c) &&
            (m.GetOrDefault(boneX - 1, boneY, 999) == c) &&
            (m.GetOrDefault(boneX, boneY + 1, 999) == c) &&
            (m.GetOrDefault(boneX, boneY - 1, 999) == c))
            {
                m.Set(boneX, boneY, 2);
                i++;
            }
    }
    
    
    for (var i = 0; i < floorTiles; i++)
    {
        for (var j = 0; j < floorTiles; j++)
        {
            var xPos = this.roomX + i * gameManager.floorTileSize;
            var yPos = this.roomY + j * gameManager.floorTileSize;
            
            if (m.GetOrDefault(i, j, 0) === 2)
            {
                if (m.GetOrDefault(i, j - 1, 0) === 0) // Only need to check 1 surrounding tile
                    groupDungeon.create(xPos, yPos, 'floor1bones');
                else
                    groupDungeon.create(xPos, yPos, 'floor2bones');
            }
            else if (m.GetOrDefault(i, j, 0) === 0)
            {
                groupDungeon.create(xPos, yPos, 'floor1');
            }
            else
            {
                if (m.GetOrDefault(i, j - 1, 0) === 0) // Top is open
                {
                    if (m.GetOrDefault(i - 1, j, 0) === 0) // Left is also open
                    {
                        groupDungeon.create(xPos, yPos, 'floor2topleft');
                    }
                    else if (m.GetOrDefault(i + 1, j, 0) === 0) // Right is also open
                    {
                        groupDungeon.create(xPos, yPos, 'floor2topright');
                    }
                    else
                    {
                        var suff = i % 2 === 0 ? 'b' : 'a';
                        groupDungeon.create(xPos, yPos, 'floor2top' + suff);
                    }
                }
                else if (m.GetOrDefault(i, j + 1, 0) === 0) // Bottom is open
                {
                    if (m.GetOrDefault(i - 1, j, 0) === 0) // Left is also open
                    {
                        groupDungeon.create(xPos, yPos, 'floor2botleft');
                    }
                    else if (m.GetOrDefault(i + 1, j, 0) === 0) // Right is also open
                    {
                        groupDungeon.create(xPos, yPos, 'floor2botright');
                    }
                    else
                    {
                        var suff = i % 2 === 0 ? 'a' : 'b';
                        groupDungeon.create(xPos, yPos, 'floor2bot' + suff);
                    }
                }
                else if (m.GetOrDefault(i + 1, j, 0) === 0) // Right is open
                {
                    var suff = j % 2 === 0 ? 'a' : 'b';
                    groupDungeon.create(xPos, yPos, 'floor2right' + suff);
                }
                else if (m.GetOrDefault(i - 1, j, 0) === 0) // Left is open
                {
                    var suff = j % 2 === 0 ? 'a' : 'b';
                    groupDungeon.create(xPos, yPos, 'floor2left' + suff);
                }
                else
                {
                    if (m.GetOrDefault(i + 1, j + 1, 0) === 0)
                        groupDungeon.create(xPos, yPos, 'floor2botrightfull');
                    else if (m.GetOrDefault(i - 1, j + 1, 0) === 0)
                        groupDungeon.create(xPos, yPos, 'floor2botleftfull');
                    else if (m.GetOrDefault(i - 1, j - 1, 0) === 0)
                        groupDungeon.create(xPos, yPos, 'floor2topleftfull');
                    else if (m.GetOrDefault(i + 1, j - 1, 0) === 0)
                        groupDungeon.create(xPos, yPos, 'floor2toprightfull');
                    else
                        groupDungeon.create(xPos, yPos, 'floor2');
                }
                
            }

            //groupDungeon.create(xPos, yPos, 'floor');
        }
    }
}

Room.prototype.CreateWall = function (x, y, image, small)
{
    var sprite = groupDungeonWalls.create(this.roomX + x * gameManager.tileSize, this.roomY + y * gameManager.tileSize, image);
    sprite.body.immovable = true;
    
    // Fill in solidMap to include wall created
    this.solidMap[y * 2][x * 2] = 1;

    if (!small) {
        this.solidMap[y * 2][x * 2 + 1] = 1;
        this.solidMap[y * 2 + 1][x * 2] = 1;
        this.solidMap[y * 2 + 1][x * 2 + 1] = 1;
    }
}

Room.prototype.WallImageRandomInt = function ()
{
    var num = Utility.RandomInt(0, 100);
    if (num < 55) num = 1;
    else if (num < 65) num = 2;
    else if (num < 75) num = 3;
    else if (num < 85) num = 4;
    else if (num < 95) num = 5;
    else num = 6;
    
    return num;
}


Room.prototype.CreateWalls = function ()
{
    var posWest = 0;
    var posEast = gameManager.roomSize - 1;
    var posNorth = 0;
    var posSouth = gameManager.roomSize - 1;
    
    // Create the corners first, these will always be the same tile.
    this.CreateWall(posWest, posNorth, 'wall_nw');
    this.CreateWall(posWest, posSouth, 'wall_sw');
    this.CreateWall(posEast, posSouth, 'wall_se');
    this.CreateWall(posEast, posNorth, 'wall_ne');
    
    // Create north walls
    for (var i = 1; i < gameManager.roomSize - 1; i++)
    {
        if (this.DoorAtPosition('n', i))
        {
            
        }
        else if (this.DoorAtPosition('n', i + 1))
        {
            this.CreateWall(posWest + i, posNorth, 'wall_dna');
        }
        else if (this.DoorAtPosition('n', i - 1))
        {
            this.CreateWall(posWest + i, posNorth, 'wall_dnb');
        }
        else
        {
            this.CreateWall(posWest + i, posNorth, 'wall_n' + this.WallImageRandomInt());
        }
    }
    
    // Create south walls
    for (var i = 1; i < gameManager.roomSize - 1; i++)
    {
        if (this.DoorAtPosition('s', i))
        {
            
        }
        else if (this.DoorAtPosition('s', i + 1))
        {
            this.CreateWall(posWest + i, posSouth, 'wall_dsa');
        }
        else if (this.DoorAtPosition('s', i - 1))
        {
            this.CreateWall(posWest + i, posSouth, 'wall_dsb');
        }
        else
        {
            this.CreateWall(posWest + i, posSouth, 'wall_s' + this.WallImageRandomInt());
        }
    }
    
    // Create west walls
    for (var i = 1; i < gameManager.roomSize - 1; i++)
    {
        if (this.DoorAtPosition('w', i))
        {
            
        }
        else if (this.DoorAtPosition('w', i + 1))
        {
            this.CreateWall(posWest, posNorth + i, 'wall_dwa');
        }
        else if (this.DoorAtPosition('w', i - 1))
        {
            this.CreateWall(posWest, posNorth + i, 'wall_dwb');
        }
        else
        {
            this.CreateWall(posWest, posNorth + i, 'wall_w' + this.WallImageRandomInt());
        }
    }
    
    // Create east walls
    for (var i = 1; i < gameManager.roomSize - 1; i++)
    {
        if (this.DoorAtPosition('e', i))
        {
            
        }
        else if (this.DoorAtPosition('e', i + 1))
        {
            this.CreateWall(posEast, posNorth + i, 'wall_dea');
        }
        else if (this.DoorAtPosition('e', i - 1))
        {
            this.CreateWall(posEast, posNorth + i, 'wall_deb');
        }
        else
        {
            this.CreateWall(posEast, posNorth + i, 'wall_e' + this.WallImageRandomInt());
        }
    }
}

Room.prototype.CreateDebris = function ()
{
    var amountOfDebris = Utility.RandomInt(2, 7);
    
    for (var i = 0; i < amountOfDebris; i++)
    {
        var x = Utility.RandomInt(gameManager.roomSize);
        var y = Utility.RandomInt(gameManager.roomSize);
        
        if (this.solidMap[y * 2][x * 2] === 0)
        {
            var size = Utility.RandomInt(2);
            
            if (size === 0)
            {
                var imageNum = Utility.RandomInt(1, 3);
                this.CreateWall(x, y, 'debris_small' + imageNum, true);
            }
            else
            {
                var imageNum = Utility.RandomInt(1, 4);
                this.CreateWall(x, y, 'debris_medium' + imageNum);
            }
            
        }
        else
        {
            i--;
        }
    }
}

Room.prototype.Init = function ()
{
    this.CreateFloor();
    this.CreateWalls();
    
    // Add in keys onto ground
    for (var i = 0; i < this.keys.length; i++)
    {
        var xPos = this.roomX + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        var yPos = this.roomY + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        var key = new Key(xPos, yPos, this.keys[i]);
    }

    if (this.startRoom)
    {
        player.SetStartPosition(this.roomX + gameManager.roomSize * gameManager.tileSize / 2, this.roomY + gameManager.roomSize * gameManager.tileSize / 2);
    }

    if (this.bossRoom)
    {
        var xPos = this.roomX + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        var yPos = this.roomY + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        var xPos2 = this.roomX + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        var yPos2 = this.roomY + Utility.RandomInt(1, gameManager.roomSize - 1) * gameManager.tileSize;
        
        var levelExit = new LevelExit(xPos, yPos);
        var slime = new Slime(xPos2, yPos2, this);
    }
    
    // Load all the doors
    for (var i = 0; i < this.doors.length; i++)
    {
        var pos = this.doors[i].Init(this.roomX, this.roomY);
        this.solidMap[pos.y * 2][pos.x * 2] = 1;
        this.solidMap[pos.y * 2 + 1][pos.x * 2] = 1;
        this.solidMap[pos.y * 2][pos.x * 2 + 1] = 1;
        this.solidMap[pos.y * 2 + 1][pos.x * 2 + 1] = 1;
    }
    
    this.CreateDebris();
}

Room.prototype.Update = function ()
{
    // Update monsters
    for (var i = 0; i < this.monsters.length; i++)
    {
        this.monsters[i].Update();
    }

    for (var i = 0; i < this.doors.length; i++)
    {
        this.doors[i].Update();
    }
}
