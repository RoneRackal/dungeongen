function Dungeon(size, wings, roomsPerWingMin, roomsPerWingMax)
{
    this.size = size || 9; // width/height of this dungeon in length of rooms
    this.rooms = []; // List of room objects in this dungeon
    this.availableRooms = []; // List of room locations available to use during dungeon generation
    this.wingAvailableRooms = []; // List of room locations available for current wing to use during dungeon generation
    this.takenRooms = []; // List of room locations already used during dungeon generation
    this.wingTakenRooms = []; // List of room locations already used during dungeon generation
    this.currentRoom; // Room that the player is currently in. Set whenever the player enters a new room
    this.GenerateKeys();
    this.GenerateDungeon(wings, roomsPerWingMin, roomsPerWingMax);
}

Dungeon.prototype.GenerateKeys = function()
{
    this.keyColours = [
        0xFF0000,
        0x0000FF,
        0x008000,
        0xFFFF00,
        0xFF00FF,
        0xC0C0C0,
        0x00FFFF,
        0x000080,
        0xFFFFFF,
        0x008080,
        0x000000,
        0x808080,
        0x800000,
        0x808000,
        0x00FF00,
        0x800080
    ];
}

Dungeon.prototype.GenerateDungeon = function (wings, roomsPerWingMin, roomsPerWingMax)
{
    this.currentKey = 0;

    game.world.setBounds(0, 0, this.size * gameManager.roomSize * gameManager.tileSize, this.size * gameManager.roomSize * gameManager.tileSize + gameManager.hudHeight);

    // Create starting room
    var firstRoomX = Utility.RandomInt(0, this.size);
    var firstRoomY = Utility.RandomInt(0, this.size);
    var firstRoom = new Room(firstRoomX, firstRoomY);
    firstRoom.SetRoomAsStart();

    this.rooms.push(firstRoom);
    this.takenRooms.push(new Vector(firstRoomX, firstRoomY));
    this.AddSurroundingRoomsToAvailable(firstRoomX, firstRoomY);

    // TODO: Add in initial rooms

    var wingDebt = 0;

    for (var currentWing = 0; currentWing < wings; currentWing++)
    {
        var roomsInThisWing = Utility.RandomInt(roomsPerWingMin, roomsPerWingMax + 1);
        var currentRoomInWing = 0;
        
        if (currentWing + 1 == wings) // if boss wing, add 1 room
        {
            roomsInThisWing++;
        }

        this.wingAvailableRooms.empty();
        this.wingTakenRooms.empty();

        while (currentRoomInWing < roomsInThisWing) // Loop room creation until we have completed our dungeon
        {
            var useFullAvailableList = currentRoomInWing == 0;
            var requiresLock = currentRoomInWing == 0;
            var isBossRoom = (currentRoomInWing + 1 == roomsInThisWing && currentWing + 1 == wings);

            this.CreateRoom(useFullAvailableList, (requiresLock || isBossRoom), isBossRoom);
            currentRoomInWing++;
        }
    }

    // After main-path rooms are done, we can add in bonus rooms



    // Now we can load the rooms
    for (var i = 0; i < this.rooms.length; i++)
    {
        this.rooms[i].Init();
    }
}

Dungeon.prototype.CreateRoom = function (useFullAvailableList, requiresLock, isBossRoom)
{
    var newRoomLocation;

    if (useFullAvailableList)
    {
        var arrayLocation = Utility.RandomInt(0, this.availableRooms.length);
        newRoomLocation = this.availableRooms[arrayLocation];
        this.availableRooms.removeAt(arrayLocation); // Room location is no longer available
    }
    else
    {
        var arrayLocation = Utility.RandomInt(0, this.wingAvailableRooms.length);
        newRoomLocation = this.wingAvailableRooms[arrayLocation];

        // Room no longer available, remove from AvailableList and WingAvailableList
        var availableRoomsArrayPos = newRoomLocation.PositionInArray(this.availableRooms); // Remove from AvailableList
        this.availableRooms.removeAt(availableRoomsArrayPos)
        this.wingAvailableRooms.removeAt(arrayLocation);
    }

    var newRoomX = newRoomLocation.x;
    var newRoomY = newRoomLocation.y;

    var newRoom = new Room(newRoomX, newRoomY);

    // Find an adjacent room which exists and add doorway
    var directionToCheck = Utility.RandomInt(0, 4);
    var foundConnectingRoom = false;

    var doorPosition = Utility.RandomInt(2, gameManager.roomSize - 2); // Don't put it near a wall, taking door size into account

    var takenRoomsToCheck;
    if (useFullAvailableList)
        takenRoomsToCheck = this.takenRooms;
    else
        takenRoomsToCheck = this.wingTakenRooms;

    while (!foundConnectingRoom)
    {
        switch (directionToCheck)
        {
            case 0: // North
                if ((new Vector(newRoomX, newRoomY - 1)).IsInArray(takenRoomsToCheck))
                {
                    var room = this.FindRoomAtPosition(newRoomX, newRoomY - 1);
                    var doorNum = room.AddDoor('s', doorPosition);
                    newRoom.AddDoor('n', doorPosition);
                    if (requiresLock)
                        this.AddLockAndKey(doorNum, room)

                    foundConnectingRoom = true;
                }
                break;
            case 1: // East
                if ((new Vector(newRoomX + 1, newRoomY)).IsInArray(takenRoomsToCheck))
                {
                    var room = this.FindRoomAtPosition(newRoomX + 1, newRoomY);
                    var doorNum = room.AddDoor('w', doorPosition);
                    newRoom.AddDoor('e', doorPosition);
                    if (requiresLock)
                        this.AddLockAndKey(doorNum, room)

                    foundConnectingRoom = true;
                }
                break;
            case 2: // South
                if ((new Vector(newRoomX, newRoomY + 1)).IsInArray(takenRoomsToCheck))
                {
                    var room = this.FindRoomAtPosition(newRoomX, newRoomY + 1);
                    var doorNum = room.AddDoor('n', doorPosition);
                    newRoom.AddDoor('s', doorPosition);
                    if (requiresLock)
                        this.AddLockAndKey(doorNum, room)

                    foundConnectingRoom = true;
                }
                break;
            case 3: // West
                if ((new Vector(newRoomX - 1, newRoomY)).IsInArray(takenRoomsToCheck))
                {
                    var room = this.FindRoomAtPosition(newRoomX - 1, newRoomY);
                    var doorNum = room.AddDoor('e', doorPosition);
                    newRoom.AddDoor('w', doorPosition);
                    if (requiresLock)
                        this.AddLockAndKey(doorNum, room)

                    foundConnectingRoom = true;
                }
                break;
        }

        directionToCheck++; // Check next direction if not available at the chosen direction
        if (directionToCheck > 3)
            directionToCheck = 0; // Loop back to North
    }

    if (isBossRoom)
    {
        newRoom.SetRoomAsBoss();
    }
    else
    {
        newRoom.SetMonsters(1);
    }

    this.rooms.push(newRoom);
    this.takenRooms.push(new Vector(newRoomX, newRoomY));
    this.wingTakenRooms.push(new Vector(newRoomX, newRoomY));
    this.AddSurroundingRoomsToAvailable(newRoomX, newRoomY);
}

Dungeon.prototype.AddLockAndKey = function(doorNum, room)
{
    if (this.rooms.length > 0)
    {
        this.rooms[this.rooms.length - 1].AddKey(this.keyColours[this.currentKey]);
        room.AddLock(doorNum, this.keyColours[this.currentKey], this.keyColours[this.currentKey]);

        this.currentKey++;
    }
}

Dungeon.prototype.FindRoomAtPosition = function (x, y)
{
    for (var i = 0; i < this.rooms.length; i++)
    {
        if (this.rooms[i].positionInDungeon.x == x && this.rooms[i].positionInDungeon.y == y)
        {
            return this.rooms[i];
        }
    }

    return null;
}

Dungeon.prototype.AddSurroundingRoomsToAvailable = function (x, y)
{
    this.AddAvailableRoom(x + 1, y);
    this.AddAvailableRoom(x, y + 1);
    this.AddAvailableRoom(x, y - 1);
    this.AddAvailableRoom(x - 1, y);
}

Dungeon.prototype.AddAvailableRoom = function (x, y)
{
    var newVector = new Vector(x, y);

    // If out of dungeon bounds, do not add
    if (x >= this.size || y >= this.size || x < 0 || y < 0)
        return;

    // If room has already been used, do not add
    if (newVector.IsInArray(this.takenRooms))
        return;

    // If already in list of available rooms, do not add
    if (!newVector.IsInArray(this.availableRooms))
        this.availableRooms.push(newVector);

    // If already in list of available rooms, do not add
    if (!newVector.IsInArray(this.wingAvailableRooms))
        this.wingAvailableRooms.push(newVector);
}

// Activates monsters within the given room
Dungeon.prototype.ActivateMonsters = function (newRoom)
{
    for (var i = 0; i < this.rooms.length; i++)
    {
        if (this.rooms[i].positionInDungeon.Equals(newRoom))
        {
            this.rooms[i].ActivateMonsters();
            break;
        }
    }
}

Dungeon.prototype.RoomChanged = function (newRoom)
{
    for (var i = 0; i < this.rooms.length; i++)
    {
        if (this.rooms[i].positionInDungeon.Equals(newRoom))
        {
            this.rooms[i].RoomEntered();
            this.currentRoom = this.rooms[i];
            break;
        }
    }
}

Dungeon.prototype.Destroy = function ()
{
    groupDungeon.destroy(true, true);
    groupDungeonWalls.destroy(true, true);
    groupPickupItems.destroy(true, true);
    groupLevelEntities.destroy(true, true);
}

Dungeon.prototype.Update = function ()
{
    if (this.currentRoom)
    {
        this.currentRoom.Update();
    }
}

Dungeon.prototype.Draw = function ()
{
    
}

