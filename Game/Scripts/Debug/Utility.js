window.Utility = {
    Random: function (a, b)
    {
        if (typeof (b) === 'undefined')
        {
            return Math.random() * a;
        }

        return Math.random() * (b - a) + a;
    },
    RandomInt: function (a, b)
    {
        if (typeof (b) === 'undefined')
        {
            return Math.floor(Math.random() * a);
        }

        return Math.floor(Math.random() * (b - a) + a);
    },
    Clone: function (obj)
    {
        return JSON.parse(JSON.stringify(obj));
    },
    StringToFunction: function (str)
    {
        var arr = str.split(".");

        var fn = (window || this);
        for (var i = 0, len = arr.length; i < len; i++)
        {
            fn = fn[arr[i]];
        }

        if (typeof fn !== "function") {
            throw new Error("StringToFunction: Function not found");
        }

        return  fn;
    }
};

function Vector(x, y)
{
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype.Length = function ()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

// Returns the angle of this Vector, from 0 to 2pi
Vector.prototype.Angle = function (degrees)
{
    degrees = degrees || false;

    var a = Math.atan(this.y / this.x);

    if (this.x < 0)
    {
        a += Math.PI;
    }

    if (a < 0)
    {
        a += Math.PI * 2;
    }

    return degrees ? a / Math.PI * 180 : a;
}

Vector.prototype.Equals = function (v)
{
    return this.x === v.x && this.y === v.y;
}

Vector.prototype.UnitVector = function ()
{
    var length = this.Length();

    return new Vector(this.x / length, this.y / length);
}

Vector.prototype.IsInArray = function (a)
{
    for (var i = 0; i < a.length; i++)
    {
        if (a[i].x === this.x && a[i].y === this.y)
        {
            return true;
        }
    }

    return false;
}

Vector.prototype.Multiply = function (a)
{
    this.x *= a;
    this.y *= a;
    
    return this;
}

Vector.prototype.Divide = function (a)
{
    this.x /= a;
    this.y /= a;
}

Vector.prototype.PositionInArray = function (a)
{
    for (var i = 0; i < a.length; i++)
    {
        if (a[i].x === this.x && a[i].y === this.y)
        {
            return i;
        }
    }

    return -1;
}

Vector.prototype.DistanceTo = function (v)
{
    var d = new Vector(this.x - v.x, this.y - v.y);
    return d.Length();
}

Array.prototype.removeAt = function (i)
{
    this.splice(i, 1);
}

Array.prototype.empty = function ()
{
    while (this.length > 0)
    {
        this.pop();
    }
}

function CreateMatrix(rows, cols, defaultValue)
{
    var m = [];

    for(var i = 0; i < rows; i++)
    {
        m.push([]);
        m[i].push(new Array(cols));

        for(var j = 0; j < cols; j++)
        {
            if (typeof defaultValue === "object")
            {
                m[i][j] = Utility.Clone(defaultValue);
            }
            else
            {
                m[i][j] = defaultValue;
            }
            
        }
    }

    return m;
}

function Matrix(rows, columns, defaultValue)
{
    this.matrix = [];
    this.rows = rows;
    this.columns = columns;
    
    for (var i = 0 ; i < rows; i++)
    {
        this.matrix.push([]);
        this.matrix[i].push(new Array(columns));
        
        for (var j = 0; j < columns; j++)
        {
            if (typeof defaultValue === "object")
            {
                this.matrix[i][j] = Utility.Clone(defaultValue);
            }
            else
            {
                this.matrix[i][j] = defaultValue;
            }
        }
    }
}

Matrix.prototype.Set = function (x, y, value)
{
    this.matrix[x][y] = value;
}

Matrix.prototype.Get = function (x, y)
{
    return this.matrix[x][y];
}

Matrix.prototype.GetOrDefault = function (x, y, defaultValue)
{
    if (x < 0 || y < 0 || x >= this.rows || y >= this.columns)
        return defaultValue;
    
    return this.matrix[x][y];
}

Phaser.Physics.Arcade.Body.prototype.MoveTowardsPosition = function (x, y, speed) 
{
    var v = new Vector(x - this.x, y - this.y);

    v = v.UnitVector();

    this.velocity.x = v.x * speed;
    this.velocity.y = v.y * speed;
}
