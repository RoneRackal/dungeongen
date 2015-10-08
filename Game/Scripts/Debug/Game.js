window.gameManager = new GameManager();

window.game = new Phaser.Game(gameManager.cameraWidth, gameManager.cameraHeight, Phaser.AUTO, 'Dungeon Game', { preload: Preload, create: Init, update: Update, render: Draw });

window.easystar = new EasyStar.js();
window.easystar.setAcceptableTiles([0]);
window.easystar.enableDiagonals();
window.easystar.enableSync();

var player;
var dungeon;
var hud;
var lootManager;

function Init()
{
    gameManager.Init();
}

function Preload()
{
    gameManager.Preload();
}

function Update()
{
    gameManager.Update();
}

function Draw()
{
    gameManager.Draw();
}

function GameManager()
{
    this.level = 1;
    this.tileSize = 64; // Amount of pixels per tile
    this.floorTileSize = 32; // Amount of pixels for floor tiles
    this.roomSize = 13; // Amount of tiles per room
    this.hudHeight = 64; // Height in pixels of the HUD, to add to the camera

    
    this.cameraWidth = this.tileSize * this.roomSize;
    this.cameraHeight = this.tileSize * this.roomSize + this.hudHeight;
    
    this.movementEnabled = true;

    this.Init = function ()
    {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.refresh();
        
        window.onresize = function ()
        {
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.scale.refresh();
        }
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = 0x999999;
        game.world.setBounds(0, 0, 1920, 1920);
        game.camera.width = this.cameraWidth;
        game.camera.height = this.cameraHeight;

        // Under block layer
        groupUnderBlockLayer = game.add.group();
        groupUnderBlockLayer.enableBody = true;
        groupUnderBlockLayer.physicsBodyType = Phaser.Physics.ARCADE;

        // Monster Projectiles
        groupMonsterProjectiles = game.add.group();
        groupMonsterProjectiles.enableBody = true;
        groupMonsterProjectiles.physicsBodyType = Phaser.Physics.ARCADE;

        // Player Projectiles
        groupPlayerProjectiles = game.add.group();
        groupPlayerProjectiles.enableBody = true;
        groupPlayerProjectiles.physicsBodyType = Phaser.Physics.ARCADE;

        // Dungeon
        groupDungeon = game.add.group();

        // Dungeon walls
        groupDungeonWalls = game.add.group();
        groupDungeonWalls.enableBody = true;
        groupDungeonWalls.physicsBodyType = Phaser.Physics.ARCADE;

        // Level Entities
        groupLevelEntities = game.add.group();
        groupLevelEntities.enableBody = true;
        groupLevelEntities.physicsBodyType = Phaser.Physics.ARCADE;

        // Pickup items
        groupPickupItems = game.add.group();
        groupPickupItems.enableBody = true;
        groupPickupItems.physicsBodyType = Phaser.Physics.ARCADE;

        // Actors
        groupActors = game.add.group();
        groupActors.enableBody = true;
        groupActors.physicsBodyType = Phaser.Physics.ARCADE;

        // Dungeon overhead
        groupDungeonOverhead = game.add.group();
        
        // HUD
        groupHUD = game.add.group();
        groupHUD.fixedToCamera = true;
            
            // Minimap, inside HUD group
            groupMinimap = groupHUD.add(new Phaser.Group(game));

        player = new Player();
        hud = new HUD();
        lootManager = new LootManager();

        this.CreateDungeon();
    }

    this.Preload = function ()
    {
        // Actors
        game.load.image('player', 'Sprites/Actors/player.png');
        game.load.image('bullet', 'Sprites/Actors/bullet.png');
        game.load.image('fireball', 'Sprites/Actors/fireball.png');
        game.load.image('swordattack', 'Sprites/Actors/sword.png');

        game.load.spritesheet('player_base', 'Sprites/Actors/player_base.png', 64, 64, 88);
        game.load.spritesheet('player_temp', 'Sprites/Actors/player_temp.png', 64, 64, 88);

        // Pickup Items
        game.load.image('key', 'Sprites/PickupItems/key.png');
        game.load.image('pickupheart', 'Sprites/PickupItems/pickupheart.png');
        game.load.image('coin1', 'Sprites/PickupItems/coin1.png');
        game.load.image('coin5', 'Sprites/PickupItems/coin5.png');
        game.load.image('coin10', 'Sprites/PickupItems/coin10.png');

        // Monsters
        game.load.spritesheet('slime', 'Sprites/Actors/slime.png', 32, 32, 12);
        game.load.spritesheet('bat', 'Sprites/Actors/bat.png', 32, 32, 12);

        game.load.image('levelexit', 'Sprites/levelexit.png');
        game.load.image('minislime', 'Sprites/minislime.png');

        // Projectiles
        game.load.spritesheet('slimeattack', 'Sprites/Actors/slimeattack.png', 96, 96);
        game.load.spritesheet('batattack', 'Sprites/Actors/batattack.png', 96, 96);
        
        // Common
        game.load.image('block64', 'Sprites/Common/block64.png');
        game.load.image('block8', 'Sprites/Common/block8.png');
        
        // HUD
        game.load.image('hud', 'Sprites/HUD/hud.png');
        game.load.image('hudheart1', 'Sprites/HUD/hudheart1.png');
        game.load.image('hudheart2', 'Sprites/HUD/hudheart2.png');
        game.load.image('hudheart3', 'Sprites/HUD/hudheart3.png');
        game.load.image('hudheart4', 'Sprites/HUD/hudheart4.png');
        game.load.image('hudmelee', 'Sprites/HUD/hudmelee.png');
        game.load.image('hudranged', 'Sprites/HUD/hudranged.png');

        // Floor
        game.load.image('floor1', 'Sprites/Dungeon/floor1.png');
        game.load.image('floor2', 'Sprites/Dungeon/floor2.png');
        game.load.image('floor1bones', 'Sprites/Dungeon/floor1bones.png');
        game.load.image('floor2bones', 'Sprites/Dungeon/floor2bones.png');
        game.load.image('floor2topa', 'Sprites/Dungeon/floor2topa.png');
        game.load.image('floor2topb', 'Sprites/Dungeon/floor2topb.png');
        game.load.image('floor2topright', 'Sprites/Dungeon/floor2topright.png');
        game.load.image('floor2topleft', 'Sprites/Dungeon/floor2topleft.png');
        game.load.image('floor2bota', 'Sprites/Dungeon/floor2bota.png');
        game.load.image('floor2botb', 'Sprites/Dungeon/floor2botb.png');
        game.load.image('floor2botright', 'Sprites/Dungeon/floor2botright.png');
        game.load.image('floor2botleft', 'Sprites/Dungeon/floor2botleft.png');
        game.load.image('floor2righta', 'Sprites/Dungeon/floor2righta.png');
        game.load.image('floor2rightb', 'Sprites/Dungeon/floor2rightb.png');
        game.load.image('floor2lefta', 'Sprites/Dungeon/floor2lefta.png');
        game.load.image('floor2leftb', 'Sprites/Dungeon/floor2leftb.png');
        game.load.image('floor2botrightfull', 'Sprites/Dungeon/floor2botrightfull.png');
        game.load.image('floor2botleftfull', 'Sprites/Dungeon/floor2botleftfull.png');
        game.load.image('floor2toprightfull', 'Sprites/Dungeon/floor2toprightfull.png');
        game.load.image('floor2topleftfull', 'Sprites/Dungeon/floor2topleftfull.png');
        
        // Debris
        // game.load.image('debris_small1', '');
        // game.load.image('debris_small2', '');
        // game.load.image('debris_small3', '');
        // game.load.image('debris_small4', '');
        game.load.image('debris_medium1', 'Sprites/Dungeon/debris_medium_0.png');
        game.load.image('debris_medium2', 'Sprites/Dungeon/debris_medium_1.png');
        game.load.image('debris_medium3', 'Sprites/Dungeon/debris_medium_2.png');
        
        game.load.image('debris_small1', 'Sprites/Dungeon/debris_small_0.png');
        game.load.image('debris_small2', 'Sprites/Dungeon/debris_small_1.png');

        // Doors
        game.load.image('lock', 'Sprites/Dungeon/lock.png');

        game.load.image('door_n', 'Sprites/Dungeon/doorn.png');
        game.load.image('door_e', 'Sprites/Dungeon/doore.png');
        game.load.image('door_s', 'Sprites/Dungeon/doors.png');
        game.load.image('door_w', 'Sprites/Dungeon/doorw.png');
        game.load.image('door_n_open', 'Sprites/Dungeon/doornopen.png');
        game.load.image('door_e_open', 'Sprites/Dungeon/dooreopen.png');
        game.load.image('door_s_open', 'Sprites/Dungeon/doorsopen.png');
        game.load.image('door_w_open', 'Sprites/Dungeon/doorwopen.png');
        
        // Walls
        game.load.image('wall_dna', 'Sprites/Dungeon/walldna.png');
        game.load.image('wall_dnb', 'Sprites/Dungeon/walldnb.png');
        game.load.image('wall_dea', 'Sprites/Dungeon/walldea.png');
        game.load.image('wall_deb', 'Sprites/Dungeon/walldeb.png');
        game.load.image('wall_dsa', 'Sprites/Dungeon/walldsa.png');
        game.load.image('wall_dsb', 'Sprites/Dungeon/walldsb.png');
        game.load.image('wall_dwa', 'Sprites/Dungeon/walldwa.png');
        game.load.image('wall_dwb', 'Sprites/Dungeon/walldwb.png');
        
        game.load.image('wall_ne', 'Sprites/Dungeon/wallne.png');
        game.load.image('wall_nw', 'Sprites/Dungeon/wallnw.png');
        game.load.image('wall_se', 'Sprites/Dungeon/wallse.png');
        game.load.image('wall_sw', 'Sprites/Dungeon/wallsw.png');
        game.load.image('wall_e1', 'Sprites/Dungeon/walle1.png');
        game.load.image('wall_e2', 'Sprites/Dungeon/walle2.png');
        game.load.image('wall_e3', 'Sprites/Dungeon/walle3.png');
        game.load.image('wall_e4', 'Sprites/Dungeon/walle4.png');
        game.load.image('wall_e5', 'Sprites/Dungeon/walle5.png');
        game.load.image('wall_e6', 'Sprites/Dungeon/walle6.png');
        game.load.image('wall_n1', 'Sprites/Dungeon/walln1.png');
        game.load.image('wall_n2', 'Sprites/Dungeon/walln2.png');
        game.load.image('wall_n3', 'Sprites/Dungeon/walln3.png');
        game.load.image('wall_n4', 'Sprites/Dungeon/walln4.png');
        game.load.image('wall_n5', 'Sprites/Dungeon/walln5.png');
        game.load.image('wall_n6', 'Sprites/Dungeon/walln6.png');
        game.load.image('wall_s1', 'Sprites/Dungeon/walls1.png');
        game.load.image('wall_s2', 'Sprites/Dungeon/walls2.png');
        game.load.image('wall_s3', 'Sprites/Dungeon/walls3.png');
        game.load.image('wall_s4', 'Sprites/Dungeon/walls4.png');
        game.load.image('wall_s5', 'Sprites/Dungeon/walls5.png');
        game.load.image('wall_s6', 'Sprites/Dungeon/walls6.png');
        game.load.image('wall_w1', 'Sprites/Dungeon/wallw1.png');
        game.load.image('wall_w2', 'Sprites/Dungeon/wallw2.png');
        game.load.image('wall_w3', 'Sprites/Dungeon/wallw3.png');
        game.load.image('wall_w4', 'Sprites/Dungeon/wallw4.png');
        game.load.image('wall_w5', 'Sprites/Dungeon/wallw5.png');
        game.load.image('wall_w6', 'Sprites/Dungeon/wallw6.png');
    }

    this.CreateDungeon = function ()
    {
        var dungeonSize = this.level + 6;
        var amountOfWingsMin = Math.floor(this.level / 2) + 1;
        var amountOfWingsMax = amountOfWingsMin + 2;
        var roomsPerWingMin = Math.floor(this.level / 4) + 2;
        var roomsPerWingMax = Math.floor(this.level / 3) + 4;
        
        dungeon = new Dungeon(9, Utility.RandomInt(amountOfWingsMin, amountOfWingsMax), roomsPerWingMin, roomsPerWingMax);
    }

    this.AdvanceLevel = function ()
    {
        player.instantTransition = true;
        dungeon.Destroy();
        this.level++;
        hud.Update();
        this.CreateDungeon();
    }
    
    this.RoomChanged = function (newRoom, instantTransition)
    {
        var gm = this;
        var transitionTime = 500;
        var playerShoveAmount = 75;
        var gamecamerax = newRoom.x * gameManager.tileSize * gameManager.roomSize;
        var gamecameray = newRoom.y * gameManager.tileSize * gameManager.roomSize;
        
        if (instantTransition)
        {
            game.camera.x = gamecamerax;
            game.camera.y = gamecameray;
        }
        else
        {
            // Stop movement while the transition is happening
            gm.movementEnabled = false;
            
            // Player should be shoved in the same direction as camera
            var tweenTo = new Vector(gamecamerax - game.camera.x, gamecameray - game.camera.y).UnitVector().Multiply(playerShoveAmount);
            
            game.add.tween(game.camera).to({ x: gamecamerax , y: gamecameray }, transitionTime, Phaser.Easing.Quadratic.InOut, true);
            game.add.tween(player.sprite).to({ x: player.sprite.x + tweenTo.x, y: player.sprite.y + tweenTo.y }, transitionTime, Phaser.Easing.Linear.InOut, true);
            game.time.events.add(transitionTime, function ()
            {
                gm.movementEnabled = true;
                dungeon.ActivateMonsters(newRoom);
            },
            this);
        }
        dungeon.RoomChanged(newRoom);
    }

    this.Update = function ()
    {
        player.Update();
        dungeon.Update();
    }

    this.Draw = function ()
    {
        //game.debug.body(player.sprite);
        dungeon.Draw();
    }
}