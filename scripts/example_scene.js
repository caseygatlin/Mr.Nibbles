class ExampleScene extends Phaser.Scene{
    constructor(test) {
        super({
            key: 'ExampleScene'
        });
        this.stupid_loop_count = 0;
        this.stupid_config =
		{
            scene : this,
            key : 'stupid_cat',
            x : 100,
            y : 10,
            originalStory : 5,
            isMuggle : true
        };
        this.maho_config =
		{
            scene : this,
            key : 'maho_cat',
            x : 100,
            y : 670,
            originalStory : 0
        };
        this.cat_factory = CatFactory.getInstance();
        this.ladder_configuration =
		{
            scene : this,
            key : 'ladder',
            x : 400,
            y : 445,
            setScale : false,
            setSize : true,
            scale : 1,
            width : 32,
            height : 182,
            story : 0
        };
        this.broken_configuration =
		{
            scene : this,
            key : 'broken_ladder',
            x : 400,
            y : 445,
            setScale : false,
            setSize : true,
            scale : 1,
            width : 32,
            height : 182,
            story : 0
        };
        this.platform_configuration =
		{
            scene : this,
            key : 'ground',
            x : 398,
            y : 568,
            setScale : false,
            setSize : false,
            width : 200,
            height : 10,
            scale : 1, 
            story : 0
        };
        this.cucumber_config =
		{
            scene : this,
            key : 'cucumber',
            x : 600,
            y : 535
        };
        this.styleWhiteCenter = 
		{
            fontFamily : 'ArcadeClassic',
            fill : 'White',
            fontSize : 'x-large',
            align : 'center',
            fixedWidth : 200,
        };
        this.highestStory = 6;
        this.killing_score_text = [];
        this.scoreLoop = [];
    }

	preload()
	{
	    this.physics.world.bounds.width = 800;

	    //Start up UI scene and assign to variable
		this.scene.launch('GameUI');
		this.uiOverlay = this.scene.get('GameUI');

		//For tracking the player's high score throughout the level
	}

    create(data)
    {
        this.highScore = data.CurrentScore;



        //Volume control
        this.volume = data.Volume;
        this.input.keyboard.on('keydown-NINE', () => {
            this.volume -= 0.1;
            if (this.volume < 0)
                this.volume = 0;
        });

        this.input.keyboard.on('keydown-ZERO', () => {
            this.volume += 0.1;
            if (this.volume > 1)
                this.volume = 1;
        });

        //Adds sewer background
        this.add.image(400, 400, 'sewer_background');

        //add cheese
        let cheese_config =
		{
            scene : this,
            key : 'delicious_cheese',
            x : 325,
            y : 50
        };
        this.cheese = new Cheese(cheese_config);

        //add cucumbers
        this.cucumbers = this.physics.add.group();
        this.cucumber_config.x=600;
        this.cucumber_config.y=535;
        let cucumber = new Cucumber(this.cucumber_config);
        this.cucumbers.add(cucumber);
        this.cucumber_config.x=80;
        this.cucumber_config.y=115;
        cucumber=new Cucumber(this.cucumber_config);
        this.cucumbers.add(cucumber);

        Phaser.Actions.Call(this.cucumbers.getChildren(), function (cu) {
            cu.body.allowGravity = false;
        });

        /*-*-*-*-*-*   Audio   *-*-*-*-*-*-*/
        //Base config
        let audioConfig =
		{
			mute: false,
			volume: this.volume,
			rate: 1,
			detune: 0,
			seek: 0,
			loop: true,
			delay: 0
		};

        //Initializes level sounds
        this.levelMus = this.sound.add('LevelMus');
        this.mouseWalk_SFX = this.sound.add('MouseWalk');
        this.mouseJump_SFX = this.sound.add('MouseJump', audioConfig);
        this.pointGain_SFX = this.sound.add('PointGain', audioConfig);
        this.lifeLost_SFX = this.sound.add('LifeLost', audioConfig);

        //Music
        this.levelMus.play(audioConfig);
        this.musicMute = this.game.mute;                                    //Music mutes by default
        this.levelMus.setMute(this.musicMute);
        this.input.keyboard.on('keydown-M', ()=> {       //Pressing M mutes / un-mutes
            this.game.mute = !this.game.mute;
            this.musicMute = this.game.mute;
            this.levelMus.setMute(this.musicMute);
        });

        //SFX
        this.walkMute = this.musicMute;                             //SFX mutes with music on initialization
        this.sfxMute = this.musicMute;
        this.mouseWalk_SFX.play(audioConfig);
        this.mouseWalk_SFX.setMute(this.walkMute);
        this.mouseJump_SFX.setMute(this.sfxMute);
        this.mouseJump_SFX.setLoop(false);
        this.pointGain_SFX.setMute(this.sfxMute);
        this.pointGain_SFX.setLoop(false);
        this.lifeLost_SFX.setMute(this.sfxMute);
        this.lifeLost_SFX.setLoop(false);
        /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/

        this.ladders = this.physics.add.group();
        this.normalLadder = this.physics.add.group();
        this.platforms = this.physics.add.staticGroup();

        let sematary_config =
		{
            scene : this,
            key : 'cat_sematary',
            x : 30,
            y : 760
        };
        
        this.catSematary = new CatSematary(sematary_config);
        
        this.PlatformOffset = 2;
        this.ladderWidth = 21;
		this.floorHeight = 100;

        //Ground floor (storey 0)
        this.addPlatformConfiguration(400, 790, 0, false, true, 800, 10, 1);

        //Level making arrays
        let offSetArray = [20, 60, 20, 60, 20, 325];
        let widthArray = [];
        widthArray[0] = [200, 400, 10];
        widthArray[1] = [50, 200, 450];
        widthArray[2] = [200, 400, 10];
        widthArray[3] = [50, 300, 450];
        widthArray[4] = [190, 400, 10];
        widthArray[5] = [150];
        this.levelMaker(5, offSetArray, widthArray);

        this.physics.add.collider(this.ladders, this.platforms);


        //Mouse initialization
        this.mouse = new Mouse(
		{
            scene : this,
            key : 'mouse',
            x : 100,
            y : 730
        });
        this.mouse.body.collideWorldBounds = true;

        this.cats = [];

        this.cursors = this.input.keyboard.createCursorKeys();

		let that = this;

		this.physics.add.collider(this.mouse, this.platforms, (mouse,platform) =>
	    {
			if(mouse.platform != null && mouse.body.touching.up && mouse.body.allowGravity)
			{
				mouse.hurtBy("lmao");
				return;
			}
			mouse.hangOut(platform);
			mouse.climbOff();
            if(!mouse.isCeiling)
			{
                mouse.currentStory = platform.story;
            }
		});

		this.physics.add.collider(this.mouse, this.catSematary);
		this.physics.add.collider(this.cats, this.catSematary, (cat,catSematary) =>
	    {
		    this.enter_sematary(cat);
        });
		
        this.physics.add.collider(this.cats, this.platforms, (cat,platform) =>
	    {
            if(cat.currentStory != platform.story)
			{
                cat.left = cat.left ? false : true;
                cat.currentStory = platform.story;
                if(cat.isClimbing)
				{
                    cat.climbOff();
                }
            }
            cat.currentStory = platform.story;
            cat.body.velocity.x = 0;
        });

        //TODO: kill mouse

        this.physics.add.overlap(this.mouse, this.cats, (mouse,cat) =>
		{
            if(mouse.isHoldingCucumber)
			{
                this.enter_sematary(cat,true);
                this.highScore += 150;
                this.pointGain_SFX.play();
                let x = mouse.body.position.x;
                let y = mouse.body.position.y;
                let cur_score_text = this.add.text(x-50, y-50, "150", this.styleWhiteCenter);
                this.killing_score_text.push(cur_score_text);
                this.scoreLoop.push(0);
            }
			else
			{
                mouse.hurtBy(cat);
            }
        });

        this.physics.add.overlap(this.mouse, this.cucumbers, (mouse,cucumber)=>
		{
            //cucumber disappears
            this.cucumbers.remove(cucumber);
            cucumber.visible = false;
            cucumber.destroy();
            //start ticking
			this.mouse.setCucumber();
        });

        //cheating
        this.input.keyboard.on('keydown-ENTER', () => {
            this.nextScene();
        });

        //winning
        this.physics.add.overlap(this.mouse,this.cheese,()=>{
           this.nextScene(); //TODO: Launch LevelWin, then have LevelWin take you to next level
        });

    }

    nextScene(){
        this.mouseJump_SFX.stop();
        this.pointGain_SFX.stop();
        this.mouseWalk_SFX.stop();
        this.lifeLost_SFX.stop();
        this.levelMus.stop();
        this.scene.launch('LevelWinScene', {SceneIndex: 1, LaunchScene: this});
        this.mouse.disableBody(true, true);
        this.scene.pause();
        this.events.on('resume', ()=>{
            this.scene.start('Level2', {CurrentScore: this.highScore, Volume: this.volume});
        });
    }

    update()
    {
        this.uiOverlay.updateLevelNum(1);
		let that = this;
        if(!this.stupid_loop_count)
		{
            let cur_cat = this.cat_factory.createCat(CatType.STUPID, this.stupid_config,this.mouse);
            if(cur_cat)
			{
                cur_cat.body.collideWorldBounds = true;
                this.cats.push(cur_cat);
            }
        }
		this.stupid_loop_count = (this.stupid_loop_count + 1) % 150;

		if(!this.physics.overlap(this.mouse, this.normalLadder, this.mouse.saveLadderPos))
		{
			this.mouse.checkLadderStatus();
		}

        this.mouse.update(this.cursors);

        /*-*-*-*-*-*   Audio   *-*-*-*-*-*-*/
        //Mouse walk SFX
	   if(this.mouse.isWalking)
       {
            this.walkMute = false;
            this.walkMute = this.musicMute;
            this.mouseWalk_SFX.setMute(this.walkMute);
       }
       else
       {
           this.walkMute = true;
           this.mouseWalk_SFX.setMute(this.walkMute);
       }

       //Update SFX mute with Music mute
       this.sfxMute = this.musicMute;
       this.mouseJump_SFX.setMute(this.sfxMute);
       this.pointGain_SFX.setMute(this.sfxMute);
       this.lifeLost_SFX.setMute(this.sfxMute);

       //Volume updates
       this.mouseWalk_SFX.setVolume(this.volume);
       this.mouseJump_SFX.setVolume(this.volume);
       this.pointGain_SFX.setVolume(this.volume);
       this.lifeLost_SFX.setVolume(this.volume);
       this.levelMus.setVolume(this.volume);

        /*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/


        this.physics.overlap(this.cats, this.ladders, (cat,ladder) =>
	    {
            cat.climbOrNot(ladder);
        });
		this.cats.forEach(function (cat) {
		    cat.update();
        });

		//Updates the UI with lives and scores
        this.uiOverlay.updateMouseLives(this.mouse.lives);
        this.uiOverlay.updateHighScore(this.highScore);

        if(this.killing_score_text.length!=0)
		{
		    for(var i=0;i<this.scoreLoop.length;i++){
		        this.scoreLoop[i]=(this.scoreLoop[i]+1)%50;
            }
		    let index=0;
		    while(index<this.scoreLoop.length){
		        if(!this.scoreLoop[index]){
		            let cur_text=this.killing_score_text[index];
		            cur_text.destroy();
		            cur_text=null;
		            this.killing_score_text.splice(index,1);
		            this.scoreLoop.splice(index,1);
		            continue;
                }
		        index++;
            }
        }
    }

    enter_sematary(cat, cucumber = false)
	{
        if(!cucumber)
		{
            if(cat instanceof StupidCat)
			{
                if(!cat.isMuggle)
				{
                    let newCat = this.cat_factory.createCat(CatType.MAHO,this.maho_config,this.mouse);
                    if(newCat)
					{
                        newCat.body.collideWorldBounds = true;
                        this.cats.push(newCat);
                    }
                }

                CatFactory.getInstance().killCat(cat);
                var pos = this.cats.indexOf(cat);
                this.cats.splice(pos,1);
                cat.visible = false;
                if(cat.scoreText){
                    cat.scoreText.destroy();
                    cat.scoreText=null;
                }
                cat.destroy();
            }
        }
		else
		{
            CatFactory.getInstance().killCat(cat);
            var pos = this.cats.indexOf(cat);
            this.cats.splice(pos,1);
            cat.visible = false;
            cat.destroy();
        }

    }

    addLadderConfiguration(x, y, story = 5, position)
	{
        let ladd = null;
        if(story % 2 == 1)
		{
            if(story != 1)
			{
                if(position % 2 == 1)
				{
                    this.setNormalLadder(x, y, story, position);
                    ladd = new Ladder(this.ladder_configuration);
                    this.normalLadder.add(ladd);
                }
				else
				{
                    this.setBrokenLadder(x, y, story, position);
                    ladd = new BrokenLadder(this.broken_configuration);
                }
            }
			else 
			{
                this.setNormalLadder(x, y, story, position);
                ladd = new Ladder(this.ladder_configuration);
                this.normalLadder.add(ladd);
            }
        }
		else
		{
            if(position % 2 == 1)
			{
                this.setBrokenLadder(x, y, story, position);
                ladd = new BrokenLadder(this.broken_configuration);
            }
			else
			{
                this.setNormalLadder(x, y, story, position);
                ladd = new Ladder(this.ladder_configuration);
                this.normalLadder.add(ladd);
            }
        }
        this.ladders.add(ladd);
		ladd.body.allowGravity = false;
    }

    setNormalLadder(x, y, story = 5, position)
	{
        this.ladder_configuration.x = x;
        this.ladder_configuration.y = y;
        this.ladder_configuration.story = story;
        this.ladder_configuration.width = this.ladderWidth;
        this.ladder_configuration.height = 141.4;
    }

    setBrokenLadder(x, y, story = 5, position)
	{
        this.broken_configuration.x = x;
        this.broken_configuration.y = y;
        this.broken_configuration.story = story;
        this.broken_configuration.width = this.ladderWidth;
        this.broken_configuration.height = 141.4;
    }

    addPlatformConfiguration(x, y, story, setScale, setSize, width=250, height=10, scale=1)
	{
        this.platform_configuration.x = x;
        this.platform_configuration.y = y; 
        this.platform_configuration.story = story;
        this.platform_configuration.setScale = setScale;
        this.platform_configuration.setSize = setSize;
        this.platform_configuration.width = width;
        this.platform_configuration.height = height;
        this.platform_configuration.scale = scale;
        let plat = new Platform(this.platform_configuration);
        this.platforms.add(plat);
    }
	
    //Makes a basic level automatically from the following parameters:
    //floorCount: How many floors are there in this level? One-index.
    //offsetArray: From the left-most platform's left edge, how much space should there be? Should contain one entry per floor.
    //widthArray: A two-dimensional array, first containing arrays that correspond to each floor, which contain each platform's width on that floor.
    levelMaker(floorCount, offsetArray, widthArray)
    {        
        //Formula: firstPlat.XPos + firstPlat.width / 2 + 21 + secondPlat.width / 2 = secondPlat.XPos
        //Each floor is offset by 760 - 100 * floor number.
        let storeyHeight = 140;
        let floorY = 790;
        for(let i = 1; i <= floorCount; i++)
        {
            let floorPlans = widthArray[i - 1];
            let lastXPos = offsetArray[i - 1] + floorPlans[0] / 2;
            this.addPlatformConfiguration(lastXPos, floorY - storeyHeight * i, i, false, true, floorPlans[0] - this.PlatformOffset);
            for(let j = 1; j < floorPlans.length; j++)
            {
                //The ladder's position is determined from the gaps left in the floor.
                //Place the ladder 25 + firstPlat.XPos + firstPlat.width in x...
                //and 50 below the current floor's yPos. (in js, + 50)
                this.addLadderConfiguration(10 + lastXPos + floorPlans[j - 1] / 2, floorY - storeyHeight * i + 65, i - 1,j);

                lastXPos = lastXPos + floorPlans[j-1] / 2 + this.ladderWidth + floorPlans[j] / 2;
                this.addPlatformConfiguration(lastXPos, floorY - storeyHeight * i, i, false, true, floorPlans[j] - this.PlatformOffset);
            }
        }
    }
	
	checkOverlap()
	{
		if(this.physics.overlap(this.mouse, this.normalLadder))
		{
			return true;
		}
		
		return false;
	}
}