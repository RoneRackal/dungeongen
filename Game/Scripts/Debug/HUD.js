////
//  CLASS: HUD
//  HUD class for drawing user information, needs to use the groupHUD Group
////

function HUD()
{
    this.position = new Vector(0, gameManager.tileSize * gameManager.roomSize);

    // STATIC
    this.backgroundLayer = groupHUD.add(new Phaser.Sprite(game, this.position.x, this.position.y, 'hud'));
    this.textInventory = groupHUD.add(new Phaser.Text(game, this.position.x + 20, this.position.y + 27, "Items:", { font: "bold 14px arial", fill: "#000000" }));

    // DYNAMIC
    this.textCurrentLevel = groupHUD.add(new Phaser.Text(game, 10, 10, "", { font: "bold 24px arial", fill: "#CCCC33" }));
    
    // Inventory
    this.inventory = [];
    var inventoryPosition = new Vector(this.position.x + 75, this.position.y + 20);
    this.inventoryShowMax = 5;
    
    for (var i = 0; i < this.inventoryShowMax; i++)
    {
        this.inventory.push(groupHUD.add(new Phaser.Sprite(game, inventoryPosition.x + i * 40, inventoryPosition.y, 'player')));
        this.inventory[i].visible = false;
    }

    // Player HP
    this.playerHP = [];
    var playerHPPosition = new Vector(this.position.x + 650, this.position.y + 20);

    for (var i = 0; i < 8; i++)
    {
        this.playerHP.push(groupHUD.add(new Phaser.Sprite(game, playerHPPosition.x + i * 16, inventoryPosition.y, 'hudheart4')));
        this.playerHP.visible = false;
    }
    
    // Current Weapon
    var currentWeaponPosition = new Vector(this.position.x + 600, this.position.y + 20);
    this.currentWeapon = groupHUD.add(new Phaser.Sprite(game, currentWeaponPosition.x, currentWeaponPosition.y, 'hudranged'));

    // Coins
    this.coinsTextShadow = groupHUD.add(new Phaser.Text(game, this.position.x + 542, this.position.y + 26, "", { font: "bold 12px arial", fill: "#000000" }));
    this.coinsText = groupHUD.add(new Phaser.Text(game, this.position.x + 540, this.position.y + 24, "", { font: "bold 12px arial", fill: "#FFFFFF" }));
    
    this.Update();
}

HUD.prototype.Update = function ()
{
    this.textCurrentLevel.setText("Level: " + gameManager.level);
    
    // Inventory
    
    var i = 0;
    for (i = 0; i < player.inventory.length; i++)
    {
        var item = player.inventory[i];

        if (item instanceof Key)
        {
            this.inventory[i].loadTexture('key');
            this.inventory[i].visible = true;
            this.inventory[i].tint = item.colour;
        }
    }
    
    for (; i < this.inventory.length; i++)
    {
        this.inventory[i].tint = 0xFFFFFF;
        this.inventory[i].visible = false;
    }

    // Player HP
    var heartsToShow = Math.ceil(player.health / 4);
    var lastHeartImageNum = (player.health % 4);

    for (i = 0; i < heartsToShow; i++)
    {
        this.playerHP[i].loadTexture('hudheart4');
        this.playerHP[i].visible = true;
    }

    // At this point all hearts are 4, make the last one dependant on HP remaining, unless it's supposed to be 4 anyway
    if (lastHeartImageNum > 0)
    {
        this.playerHP[i - 1].loadTexture('hudheart' + lastHeartImageNum);
    }

    // Don't display remaining hearts
    for (; i < this.playerHP.length; i++)
    {
        this.playerHP[i].visible = false;
    }

    // Current Weapon
    this.currentWeapon.loadTexture(player.melee ? 'hudmelee' : 'hudranged');

    // Coins
    this.coinsTextShadow.setText("Coins: " + player.coins);
    this.coinsText.setText("Coins: " + player.coins);

}