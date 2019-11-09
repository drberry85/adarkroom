/**
 * Module that registers the simple room functionality
 */
var Room = {
    // times in (minutes * seconds * milliseconds)
    _FIRE_COOL_DELAY: 5 * 60 * 1000, // time after a stoke before the fire cools
    _ROOM_WARM_DELAY: 30 * 1000, // time between room temperature updates
    _BUILDER_STATE_DELAY: 0.5 * 60 * 1000, // time between builder state updates
    _STOKE_COOLDOWN: 10, // cooldown to stoke the fire
    _NEED_WOOD_DELAY: 15 * 1000, // from when the stranger shows up, to when you need wood
    _NEED_FOOD_DELAY: 30 * 1000, // time between room temperature updates
    
    buttons:{},
    
    Craftables: {
        'trap': {
            name: _('trap'),
            button: null,
            maximum: 30,
            availableMsg: _('builder says she can make traps to catch any creatures might still be alive out there'),
            buildMsg: _('more traps to catch more creatures'),
            maxMsg: _("more traps won't help now"),
            type: 'building',
            cost: function() {
                var n = $SM.get('game.buildings["trap"]', true);
                return {
                    'wood': 10 + (n*5)
                };
            }
        },
        'cart': {
            name: _('cart'),
            button: null,
            maximum: 5,
            availableMsg: _('builder says she can make a cart for carrying wood'),
            buildMsg: _('the rickety cart will carry more wood and food from the forest'),
            maxMsg: _('cannot haul any more carts'),
            type: 'building',
            cost: function() {
                var cartprice = 30;
                var n = $SM.get('game.buildings["cart"]', true);
                if (n > 0) {
                    cartprice = 250 * n;
                }
                return {
                    'wood': cartprice
                };
            }
        },
        'hut': {
            name: _('hut'),
            button: null,
            maximum: 500,
            availableMsg: _("builder says there are more wanderers. says they'll work, too."),
            buildMsg: _('builder puts up a hut, out in the forest. says word will get around.'),
            maxMsg: _('no more room for huts'),
            type: 'building',
            cost: function() {
                var n = $SM.get('game.buildings["hut"]', true);
                return {
                    'wood': 100 + (n*50)
                };
            }
        },
        'lodge': {
            name: _('lodge'),
            button: null,
            maximum: 1,
            availableMsg: _('villagers could help hunt, given the means'),
            buildMsg: _('the hunting lodge stands in the forest, a ways out of town'),
            type: 'building',
            cost: function() {
                return {
                    'wood': 200,
                    'fur': 10,
                    'meat': 5
                };
            }
        },
        'garden': {
            name: _('garden'),
            button: null,
            maximum: 1,
            availableMsg: _("we can grow our own food"),
            buildMsg: _('builder finishes a meager garden'),
            type: 'building',
            cost: function() {
                return {
                    'wood': 300,
                    'forage': 50
                };
            }
        },
        'trading post': {
            name: _('trading post'),
            button: null,
            maximum: 1,
            availableMsg: _("a trading post would make commerce easier"),
            buildMsg: _("now the nomads have a place to set up shop, they might stick around a while"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 400,
                    'fur': 100
                };
            }
        },
        'tannery': {
            name: _('tannery'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says leather could be useful. says the villagers could make it."),
            buildMsg: _('tannery goes up quick, on the edge of the village'),
            type: 'building',
            cost: function() {
                return {
                    'wood': 500,
                    'fur': 50
                };
            }
        },
        'smokehouse': {
            name: _('smokehouse'),
            button: null,
            maximum: 1,
            availableMsg: _("should cure the meat, or it'll spoil. builder says she can fix something up."),
            buildMsg: _('builder finishes the smokehouse. she looks hungry.'),
            type: 'building',
            cost: function() {
                return {
                    'wood': 600,
                    'meat': 50
                };
            }
        },
        'workshop': {
            name: _('workshop'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says she could make finer things, if she had the tools"),
            buildMsg: _("workshop's finally ready. builder's excited to get to it."),
            type: 'building',
            cost: function() {
                return {
                    'wood': 800,
                    'leather': 100,
                    'scales': 10
                };
            }
        },
        'kiln': {
            name: _('kiln'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we need to have bricks for better buildings"),
            buildMsg: _("the kiln is fired up and ready to go"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 1000,
                    'brick': 100
                };
            }
        },
        'steelworks': {
            name: _('steelworks'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says the villagers could make steel, given the tools"),
            buildMsg: _("a haze falls over the village as the steelworks fires up"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 1500,
                    'brick': 500,
                    'iron': 100,
                    'coal': 100
                };
            }
        },
        'armoury': {
            name: _('armoury'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says it'd be useful to have a steady source of bullets"),
            buildMsg: _("armoury's done, welcoming back the weapons of the past"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 3000,
                    'brick': 1000,
                    'steel': 100,
                    'sulphur': 50
                };
            }
        },
        'farm': {
            name: _('farm'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can start growing our own wheat"),
            buildMsg: _("farm is done, lets get planting"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 1000,
                    'iron': 50,
                    'wheat': 25,
                    'steel': 10
                };
            }
        },
        'mill': {
            name: _('mill'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can build a mill to grind flour"),
            buildMsg: _("mill is done, it stands tall over the village"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 1500,
                    'brick': 500,
                    'steel': 50
                };
            }
        },
        'bakery': {
            name: _('bakery'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can build a bakery to start making bread"),
            buildMsg: _("bakery is done, the smell of fresh baked bread fills the air"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 2000,
                    'brick': 1000,
                    'iron': 100,
                    'steel': 100
                };
            }
        },
        'lumberyard': {
            name: _('lumberyard'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can collect wood more efficently"),
            buildMsg: _("lumberyard is done, let the wood start pooring in"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 2000,
                    'iron': 200,
                    'steel': 200
                };
            }
        },
        'dock': {
            name: _('dock'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can start fishing the river"),
            buildMsg: _("dock is done, time to start fishing"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 1000,
                    'iron': 10
                };
            }
        },
        'factory': {
            name: _('factory'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says it'd be useful to have a steady source of energy cells"),
            buildMsg: _("the factory is done, time to start making batteries"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 2000,
                    'brick': 2000,
                    'steel': 1000,
                    'coal': 2000,
                    'sulphur': 1000
                };
            }
        },
        'wall': {
            name: _('wall'),
            button: null,
            maximum: 1,
            availableMsg: _("builder says we can build better defenses"),
            buildMsg: _("the wall is complete, we all feel a little safer"),
            type: 'building',
            cost: function() {
                return {
                    'wood': 10000,
                    'brick': 5000
                };
            }
        },
        'torch': {
            name: _('torch'),
            button: null,
            type: 'tool',
            buildMsg: _('a torch to keep the dark away'),
            cost: function() {
                return {
                    'wood': 1,
                    'cloth': 1
                };
            }
        },
        'waterskin': {
            name: _('waterskin'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('this waterskin\'ll hold a bit of water, at least'),
            cost: function() {
                return {
                    'leather': 50
                };
            }
        },
        'cask': {
            name: _('cask'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('the cask holds enough water for longer expeditions'),
            cost: function() {
                return {
                    'leather': 100,
                    'iron': 20
                };
            }
        },
        'water tank': {
            name: _('water tank'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('never go thirsty again'),
            cost: function() {
                return {
                    'iron': 100,
                    'steel': 50
                };
            }
        },
        'condenser': {
            name: _('condenser'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('gather water from the air'),
            cost: function() {
                return {
                    'steel': 100,
                    'coal': 100,
                    'alien alloy': 5
                };
            }
        },
        'bone spear': {
            name: _('bone spear'),
            button: null,
            type: 'weapon',
            buildMsg: _("this spear's not elegant, but it's pretty good at stabbing"),
            cost: function() {
                return {
                    'wood': 100,
                    'teeth': 5
                };
            }
        },
        'rucksack': {
            name: _('rucksack'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('carrying more means longer expeditions to the wilds'),
            cost: function() {
                return {
                    'leather': 200
                };
            }
        },
        'wagon': {
            name: _('wagon'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('the wagon can carry a lot of supplies'),
            cost: function() {
                return {
                    'wood': 500,
                    'iron': 100
                };
            }
        },
        'convoy': {
            name: _('convoy'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('the convoy can haul mostly everything'),
            cost: function() {
                return {
                    'wood': 1000,
                    'iron': 200,
                    'steel': 100
                };
            }
        },
        'bag of holding': {
            name: _('bag of holding'),
            button: null,
            type: 'upgrade',
            maximum: 1,
            buildMsg: _('the bag has an interior space considerably larger than its outside dimensions'),
            cost: function() {
                return {
                    'leather': 500,
                    'alien alloy': 10,
                    'charm': 5
                };
            }
        },
        'l armour': {
            name: _('l armour'),
            type: 'upgrade',
            maximum: 1,
            buildMsg: _("leather's not strong. better than rags, though."),
            cost: function() {
                return {
                    'leather': 200,
                    'scales': 20
                };
            }
        },
        'i armour': {
            name: _('i armour'),
            type: 'upgrade',
            maximum: 1,
            buildMsg: _("iron's stronger than leather"),
            cost: function() {
                return {
                    'leather': 200,
                    'iron': 100
                };
            }
        },
        's armour': {
            name: _('s armour'),
            type: 'upgrade',
            maximum: 1,
            buildMsg: _("steel's stronger than iron"),
            cost: function() {
                return {
                    'leather': 200,
                    'steel': 100
                };
            }
        },
        'a armour': {
            name: _('a armour'),
            type: 'upgrade',
            maximum: 1,
            buildMsg: _("a warrior once more"),
            cost: function() {
                return {
                    'leather': 200,
                    'alien alloy': 5,
                    'charm': 1
                };
            }
        },
        'iron sword': {
            name: _('iron sword'),
            button: null,
            type: 'weapon',
            buildMsg: _("sword is sharp. good protection out in the wilds."),
            cost: function() {
                return {
                    'wood': 200,
                    'leather': 50,
                    'iron': 20
                };
            }
        },
        'steel sword': {
            name: _('steel sword'),
            button: null,
            type: 'weapon',
            buildMsg: _("the steel is strong, and the blade true"),
            cost: function() {
                return {
                    'wood': 500,
                    'leather': 100,
                    'steel': 20
                };
            }
        },
        'rifle': {
            name: _('rifle'),
            type: 'weapon',
            buildMsg: _("black powder and bullets, like the old days"),
            cost: function() {
                return {
                    'wood': 200,
                    'steel': 50,
                    'sulphur': 50
                };
            }
        },
        'lightsaber': {
            name: _('lightsaber'),
            type: 'weapon',
            buildMsg: _("an elegant weapon for a more civilized age"),
            cost: function() {
                return {
                    'energy cell': 50,
                    'alien alloy': 10
                };
            }
        }
    },
    
    TradeGoods: {
        'bait': {
            type: 'good',
            cost: function() {
                return { meat: 5 };
            }
        },
        'scales': {
            type: 'good',
            cost: function() {
                return { fur: 15 };
            }
        },
        'teeth': {
            type: 'good',
            cost: function() {
                return { fur: 30 };
            }
        },
        'leather': {
            type: 'good',
            cost: function() {
                return { fur: 25 };
            }
        },
        'cured meat': {
            type: 'good',
            cost: function() {
                return { meat: 30 };
            }
        },
        'brick': {
            type: 'good',
            cost: function() {
                return { fur: 30 };
            }
        },
        'iron': {
            type: 'good',
            cost: function() {
                return {
                    'fur': 30,
                    'scales': 5
                };
            }
        },
        'coal': {
            type: 'good',
            cost: function() {
                return {
                    'fur': 30,
                    'teeth': 5
                };
            }
        },
        'steel': {
            type: 'good',
            cost: function() {
                return {
                    'fur': 30,
                    'scales': 5,
                    'teeth': 5
                };
            }
        },
        'medicine': {
            type: 'good',
            cost: function() {
                return {
                    'scales': 20, 'teeth': 15
                };
            }
        },
        'bullets': {
            type: 'good',
            cost: function() {
                return {
                    'scales': 10
                };
            }
        },
        'energy cell': {
            type: 'good',
            cost: function() {
                return {
                    'scales': 10,
                    'teeth': 10
                };
            }
        },
        'bolas': {
            type: 'weapon',
            cost: function() {
                return {
                    'teeth': 10
                };
            }
        },
        'grenade': {
            type: 'weapon',
            cost: function() {
                return {
                    'scales': 15,
                    'teeth': 10
                };
            }
        },
        'bayonet': {
            type: 'weapon',
            cost: function() {
                return {
                    'scales': 500,
                    'teeth': 250
                };
            }
        },
        'katana': {
            type: 'weapon',
            cost: function() {
                return {
                    'scales': 500,
                    'teeth': 250
                };
            }
        },
        'alien alloy': {
            type: 'good',
            cost: function() {
                return {
                    'fur': 1000,
                    'scales': 75,
                    'teeth': 30
                };
            }
        },
        'compass': {
            type: 'special',
            maximum: 1,
            cost: function() {
                return { 
                    fur: 400, 
                    scales: 20, 
                    teeth: 10 
                };
            }
        }
    },
    
    MiscItems: {
        'laser rifle': {
            type: 'weapon'
        }
    },
    
    name: _("Room"),
    init: function(options) {
        this.options = $.extend(
            this.options,
            options
        );
        
        Room.pathDiscovery = Boolean($SM.get('stores["compass"]'));

        if(Engine._debug) {
            this._ROOM_WARM_DELAY = 5000;
            this._BUILDER_STATE_DELAY = 5000;
            this._STOKE_COOLDOWN = 0;
            this._NEED_WOOD_DELAY = 5000;
            this._NEED_FOOD_DELAY = 5000;
        }
        
        if(typeof $SM.get('features.location.room') == 'undefined') {
            $SM.set('features.location.room', true);
            $SM.set('game.builder.level', -1);
        }
        
        // If this is the first time playing, the fire is dead and it's freezing. 
        // Otherwise grab past save state temp and fire level.
        $SM.set('game.temperature', $SM.get('game.temperature.value')===undefined?this.TempEnum.Freezing:$SM.get('game.temperature'));
        $SM.set('game.fire', $SM.get('game.fire.value')===undefined?this.FireEnum.Dead:$SM.get('game.fire'));
        
        // Create the room tab
        this.tab = Header.addLocation(_("A Dark Room"), "room", Room);
        
        // Create the Room panel
        this.panel = $('<div>')
            .attr('id', "roomPanel")
            .addClass('location')
            .appendTo('div#locationSlider');
        
        Engine.updateSlider();
        
        // Create the light button
        new Button.Button({
            id: 'lightButton',
            text: _('light fire'),
            click: Room.lightFire,
            cooldown: Room._STOKE_COOLDOWN,
            width: '80px',
            cost: {'wood': 5}
        }).appendTo('div#roomPanel');
        
        // Create the stoke button
        new Button.Button({
            id: 'stokeButton',
            text: _("stoke fire"),
            click: Room.stokeFire,
            cooldown: Room._STOKE_COOLDOWN,
            width: '80px',
            cost: {'wood': 1}
        }).appendTo('div#roomPanel');
        
        // Create the stores container
        $('<div>').attr('id', 'storesContainer').prependTo('div#roomPanel');
        
        //subscribe to stateUpdates
        $.Dispatch('stateUpdate').subscribe(Room.handleStateUpdates);
        
        Room.updateButton();
        Room.updateStoresView();
        Room.updateIncomeView();
        Room.updateBuildButtons();
        
        Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
        Room._tempTimer = Engine.setTimeout(Room.adjustTemp, Room._ROOM_WARM_DELAY);
        Room._foodTimer = Engine.setTimeout(Room.needFood, Room._NEED_FOOD_DELAY);

        /*
         * Builder states:
         * 0 - Approaching
         * 1 - Collapsed
         * 2 - Shivering
         * 3 - Sleeping
         * 4 - Helping
         */
        if($SM.get('game.builder.level') >= 0 && $SM.get('game.builder.level') < 3) {
            Room._builderTimer = Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
        }
        if($SM.get('game.builder.level') == 1 && $SM.get('stores.wood', true) < 0) {
            Engine.setTimeout(Room.unlockForest, Room._NEED_WOOD_DELAY);
        }
        Engine.setTimeout($SM.collectIncome, 1000);

        Notifications.notify(Room, _("the room is {0}", Room.TempEnum.fromInt($SM.get('game.temperature.value')).text));
        Notifications.notify(Room, _("the fire is {0}", Room.FireEnum.fromInt($SM.get('game.fire.value')).text));
    },
    
    options: {}, // Nothing for now
    
    onArrival: function(transition_diff) {
        Room.setTitle();
        if(Room.changed) {
            Notifications.notify(Room, _("the fire is {0}", Room.FireEnum.fromInt($SM.get('game.fire.value')).text));
            Notifications.notify(Room, _("the room is {0}", Room.TempEnum.fromInt($SM.get('game.temperature.value')).text));
            Room.changed = false;
        }
        if($SM.get('game.builder.level') == 3) {
            $SM.add('game.builder.level', 1);
            $SM.setIncome('builder', {
                delay: 10,
                stores: {
                    'food': -1,
                    'wood': 5
                }
                
            });
            Room.updateIncomeView();
            Notifications.notify(Room, _("the stranger is standing by the fire. she says she can help. says she builds things."));
        }

        Engine.moveStoresView(null, transition_diff);
    },
    
    TempEnum: {
        fromInt: function(value) {
            for(var k in this) {
                if(typeof this[k].value != 'undefined' && this[k].value == value) {
                    return this[k];
                }
            }
            return null;
        },
        Freezing: { value: 0, text: _('freezing') },
        Cold: { value: 1, text: _('cold') },
        Mild: { value: 2, text: _('mild') },
        Warm: { value: 3, text: _('warm') },
        Hot: { value: 4, text: _('hot') }
    },
    
    FireEnum: {
        fromInt: function(value) {
            for(var k in this) {
                if(typeof this[k].value != 'undefined' && this[k].value == value) {
                    return this[k];
                }
            }
            return null;
        },
        Dead: { value: 0, text: _('dead') },
        Smoldering: { value: 1, text: _('smoldering') },
        Flickering: { value: 2, text: _('flickering') },
        Burning: { value: 3, text: _('burning') },
        Roaring: { value: 4, text: _('roaring') }
    },
    
    setTitle: function() {
        var title = $SM.get('game.fire.value') < 2 ? _("A Dark Room") : _("A Firelit Room");
        if(Engine.activeModule == this) {
            document.title = title;
        }
        $('div#location_room').text(title);
    },
    
    updateButton: function() {
        var light = $('#lightButton.button');
        var stoke = $('#stokeButton.button');
        if($SM.get('game.fire.value') == Room.FireEnum.Dead.value && stoke.css('display') != 'none') {
            stoke.hide();
            light.show();
            if(stoke.hasClass('disabled')) {
                Button.cooldown(light);
            }
        } else if(light.css('display') != 'none') {
            stoke.show();
            light.hide();
            if(light.hasClass('disabled')) {
                Button.cooldown(stoke);
            }
        }
        
        if(!$SM.get('stores.wood')) {
            light.addClass('free');
            stoke.addClass('free');
        } else {
            light.removeClass('free');
            stoke.removeClass('free');
        }
    },
    
    _fireTimer: null,
    _tempTimer: null,
    _foodTimer: null,
    lightFire: function() {
        var wood = $SM.get('stores.wood');
        if(wood < 5) {
            Notifications.notify(Room, _("not enough wood to get the fire going"));
            Button.clearCooldown($('#lightButton.button'));
            return;
        } else if(wood > 4) {
            $SM.set('stores.wood', wood - 5);
        }
        $SM.set('game.fire', Room.FireEnum.Smoldering);
        Room.onFireChange();
    },
    
    stokeFire: function() {
        var wood = $SM.get('stores.wood');
        if(wood === 0) {
            Notifications.notify(Room, _("the wood has run out"));
            Button.clearCooldown($('#stokeButton.button'));
            return;
        }
        if(wood > 0) {
            $SM.set('stores.wood', wood - 1);
        }
        if($SM.get('game.fire.value') < 4) {
            $SM.set('game.fire', Room.FireEnum.fromInt($SM.get('game.fire.value') + Math.round(Math.random())));
        }
        Room.onFireChange();
    },
    
    onFireChange: function() {
        if(Engine.activeModule != Room) {
            Room.changed = true;
        }
        Notifications.notify(Room, _("the fire is {0}", Room.FireEnum.fromInt($SM.get('game.fire.value')).text), true);
        if($SM.get('game.fire.value') > 1 && $SM.get('game.builder.level') < 0) {
            $SM.set('game.builder.level', 0);
            Notifications.notify(Room, _("the light from the fire spills from the windows, out into the dark"));
            Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
        }    
        window.clearTimeout(Room._fireTimer);
        Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
        Room.updateButton();
        Room.setTitle();
    },
    
    coolFire: function() {
        var wood = $SM.get('stores.wood');
        if($SM.get('game.fire.value') <= Room.FireEnum.Flickering.value &&
            $SM.get('game.builder.level') > 3 && wood > 0) {
            Notifications.notify(Room, _("builder stokes the fire"), true);
            $SM.set('stores.wood', wood - 1);
            $SM.set('game.fire',Room.FireEnum.fromInt($SM.get('game.fire.value') + 1));
        }
        if($SM.get('game.fire.value') > 0) {
            $SM.set('game.fire',Room.FireEnum.fromInt($SM.get('game.fire.value') - 1));
            Room._fireTimer = Engine.setTimeout(Room.coolFire, Room._FIRE_COOL_DELAY);
            Room.onFireChange();
        }
    },
    
    adjustTemp: function() {
        var old = $SM.get('game.temperature.value');
        if($SM.get('game.temperature.value') > 0 && $SM.get('game.temperature.value') > $SM.get('game.fire.value')) {
            $SM.set('game.temperature',Room.TempEnum.fromInt($SM.get('game.temperature.value') - 1));
            Notifications.notify(Room, _("the room is {0}" , Room.TempEnum.fromInt($SM.get('game.temperature.value')).text), true);
        }
        if($SM.get('game.temperature.value') < 4 && $SM.get('game.temperature.value') < $SM.get('game.fire.value')) {
            $SM.set('game.temperature', Room.TempEnum.fromInt($SM.get('game.temperature.value') + 1));
            Notifications.notify(Room, _("the room is {0}" , Room.TempEnum.fromInt($SM.get('game.temperature.value')).text), true);
        }
        if($SM.get('game.temperature.value') != old) {
            Room.changed = true;
        }
        Room._tempTimer = Engine.setTimeout(Room.adjustTemp, Room._ROOM_WARM_DELAY);
    },
    
    unlockForest: function() {
        $SM.set('stores.wood', 4);
        Outside.init();
        Notifications.notify(Room, _("the wind howls outside"));
        Notifications.notify(Room, _("the wood is running out"));
        Engine.event('progress', 'outside');
    },

    needFood: function() {
        if($SM.get('game.builder.level') > 1 && $SM.getFood() < 3) {
            if (!('forage'in $SM.get("stores"))) $SM.set('stores.forage', 0);
            var pops = $SM.get('game.population', true);
            if (pops > 0) {
                Notifications.notify(Room, _("people are starving in the village"));
                var numKilled  = Math.floor((Math.random() * 0.1 * pops)) + 1;
                Outside.killVillagers(numKilled);
            } else {
                Notifications.notify(Room, _("so hungry"));
                Notifications.notify(Room, _("have to find food"));
                Outside.updateForageButton();
                if (!('you' in $SM.getIncome)) {
                    $SM.setIncome('you', {
                        delay: 10,
                        stores: { 'food': -1 }
                    });
                }
            }
        }
        Room._foodTimer = Engine.setTimeout(Room.needFood, Room._NEED_FOOD_DELAY);
    },

    updateBuilderState: function() {
        var lBuilder = $SM.get('game.builder.level');
        if(lBuilder === 0) {
            Notifications.notify(Room, _("a ragged stranger stumbles through the door and collapses in the corner"));
            lBuilder = $SM.setget('game.builder.level', 1);
            Engine.setTimeout(Room.unlockForest, Room._NEED_WOOD_DELAY);
        } 
        else if(lBuilder < 3 && $SM.get('game.temperature.value') >= Room.TempEnum.Warm.value) {
            var msg = "";
            switch(lBuilder) {
            case 1:
                msg = _("the stranger shivers, and mumbles quietly. her words are unintelligible.");
                break;
            case 2:
                msg = _("the stranger in the corner stops shivering. her breathing calms.");
                break;
            }
            Notifications.notify(Room, msg);
            if(lBuilder < 3) {
                lBuilder = $SM.setget('game.builder.level', lBuilder + 1);
            }
        }
        if(lBuilder < 3) {
            Engine.setTimeout(Room.updateBuilderState, Room._BUILDER_STATE_DELAY);
        }
        Engine.saveGame();
    },
    
    updateStoresView: function() {
        var stores = $('div#stores');
        var resources = $('div#resources');
        var special = $('div#special');
        var weapons = $('div#weapons');
        var needsAppend = false, rNeedsAppend = false, sNeedsAppend = false, wNeedsAppend = false, newRow = false;
        if(stores.length === 0) {
            stores = $('<div>').attr({
                'id': 'stores',
                'data-legend': _('stores')
            }).css('opacity', 0);
            needsAppend = true;
        }
        if(resources.length === 0) {
            resources = $('<div>').attr({
                id: 'resources'
            }).css('opacity', 0);
            rNeedsAppend = true;
        }
        if(special.length === 0) {
            special = $('<div>').attr({
                id: 'special'
            }).css('opacity', 0);
            sNeedsAppend = true;
        }
        if(weapons.length === 0) {
            weapons = $('<div>').attr({
                'id': 'weapons',
                'data-legend': _('weapons')
            }).css('opacity', 0);
            wNeedsAppend = true;
        }
        for(var k in $SM.get('stores')) {
            
            var type = null;
            if(Room.Craftables[k]) {
                type = Room.Craftables[k].type;
            } else if(Room.TradeGoods[k]) {
                type = Room.TradeGoods[k].type;
            } else if (Room.MiscItems[k]) {
                type = Room.MiscItems[k].type;
            }
            
            var location;
            switch(type) {
            case 'upgrade':
                // Don't display upgrades on the Room screen
                continue;
            case 'building':
                // Don't display buildings either
                continue;
            case 'weapon':
                location = weapons;
                break;
            case 'special':
                location = special;
                break;
            default:
                location = resources;
                break;
            }
            
            var id = "row_" + k.replace(' ', '-');
            var row = $('div#' + id, location);
            var num = $SM.get('stores["'+k+'"]');
            
            if(typeof num != 'number' || isNaN(num)) {
                // No idea how counts get corrupted, but I have reason to believe that they occassionally do.
                // Build a little fence around it!
                num = 0;
                $SM.set('stores["'+k+'"]', 0);
            }
            
            var lk = _(k);
            
            // thieves?
            if(typeof $SM.get('game.thieves') == 'undefined' && num > 5000 && $SM.get('features.location.world')) {
                $SM.startThieves();
            }
            
            if(row.length === 0) {
                row = $('<div>').attr('id', id).addClass('storeRow');
                $('<div>').addClass('row_key').text(lk).appendTo(row);
                $('<div>').addClass('row_val').text(Math.floor(num)).appendTo(row);
                $('<div>').addClass('clear').appendTo(row);
                var curPrev = null;
                location.children().each(function(i) {
                    var child = $(this);
                    var cName = child.children('.row_key').text();
                    if(cName < lk) {
                        curPrev = child.attr('id');
                    }
                });
                if(curPrev == null) {
                    row.prependTo(location);
                } else {
                    row.insertAfter(location.find('#' + curPrev));
                }
                newRow = true;
            } else {
                $('div#' + row.attr('id') + ' > div.row_val', location).text(Math.floor(num));
            }
        }
                
        if(rNeedsAppend && resources.children().length > 0) {
            resources.prependTo(stores);
            resources.animate({opacity: 1}, 300, 'linear');
        }
        
        if(sNeedsAppend && special.children().length > 0) {
            special.appendTo(stores);
            special.animate({opacity: 1}, 300, 'linear');
        }
        
        if(needsAppend && stores.find('div.storeRow').length > 0) {
            stores.appendTo('div#storesContainer');
            stores.animate({opacity: 1}, 300, 'linear');
        }
        
        if(wNeedsAppend && weapons.children().length > 0) {
            weapons.appendTo('div#storesContainer');
            weapons.animate({opacity: 1}, 300, 'linear');
        }
        
        if(newRow) {
            Room.updateIncomeView();
        }

        if($("div#outsidePanel").length) {
            Outside.updateVillage();
        }

        if($SM.get('stores.compass') && !Room.pathDiscovery){
            Room.pathDiscovery = true;
            Path.openPath();
        }
    },
    
    updateIncomeView: function() {
        var stores = $('div#resources');
        var totalIncome = {};
        if(stores.length === 0 || typeof $SM.get('income') == 'undefined') return;
        $('div.storeRow', stores).each(function(index, el) {
            el = $(el);
            $('div.tooltip', el).remove();
            var ttPos = index > 10 ? 'top right' : 'bottom right';
            var tt = $('<div>').addClass('tooltip ' + ttPos);
            var storeName = el.attr('id').substring(4).replace('-', ' ');
            for(var incomeSource in $SM.get('income')) {
                var income = $SM.get('income["'+incomeSource+'"]');
                for(var store in income.stores) {
                    if(store == storeName && income.stores[store] !== 0) {
                        $('<div>').addClass('row_key').text(_(incomeSource)).appendTo(tt);
                        $('<div>')
                            .addClass('row_val')
                            .text(Engine.getIncomeMsg(income.stores[store], income.delay))
                            .appendTo(tt);
                        if (!totalIncome[store] || totalIncome[store].income === undefined) {
                            totalIncome[store] = { income: 0 };
                        }
                        totalIncome[store].income += Number(income.stores[store]);
                        totalIncome[store].delay = income.delay;
                    }
                }
            }
            if(tt.children().length > 0) {
                var total = totalIncome[storeName].income;
                $('<div>').addClass('total row_key').text(_('total')).appendTo(tt);
                $('<div>').addClass('total row_val').text(Engine.getIncomeMsg(total, totalIncome[storeName].delay)).appendTo(tt);
                tt.appendTo(el);
            }
        });
    },
    
    buy: function(buyBtn) {
        var thing = $(buyBtn).attr('buildThing');
        var good = Room.TradeGoods[thing];
        var numThings = $SM.get('stores["'+thing+'"]', true);
        if(numThings < 0) numThings = 0;
        if(good.maximum <= numThings) {
            return;
        }
        
        var storeMod = {};
        var cost = good.cost();
        for(var k in cost) {
            var have = $SM.get('stores["'+k+'"]', true);
            if(have < cost[k]) {
                Notifications.notify(Room, _("not enough " + k));
                return false;
            } else {
                storeMod[k] = have - cost[k];
            }
        }
        $SM.setM('stores', storeMod);
        
        Notifications.notify(Room, good.buildMsg);
        
        $SM.add('stores["'+thing+'"]', 1);
    },
    
    build: function(buildBtn) {
        var thing = $(buildBtn).attr('buildThing');
        if($SM.get('game.temperature.value') <= Room.TempEnum.Cold.value) {
            Notifications.notify(Room, _("builder just shivers"));
            return false;
        }
        var craftable = Room.Craftables[thing];
        
        var numThings = 0; 
        switch(craftable.type) {
        case 'good':
        case 'weapon':
        case 'tool':
        case 'upgrade':
            numThings = $SM.get('stores["'+thing+'"]', true);
            break;
        case 'building':
            numThings = $SM.get('game.buildings["'+thing+'"]', true);
            break;
        }
        
        if(numThings < 0) numThings = 0;
        if(craftable.maximum <= numThings) {
            return;
        }
        
        var storeMod = {};
        var cost = craftable.cost();
        for(var k in cost) {
            var have = $SM.get('stores["'+k+'"]', true);
            if(have < cost[k]) {
                Notifications.notify(Room, _("not enough "+k));
                return false;
            } else {
                storeMod[k] = have - cost[k];
            }
        }
        $SM.setM('stores', storeMod);
        
        Notifications.notify(Room, craftable.buildMsg);
        
        switch(craftable.type) {
        case 'good':
        case 'weapon':
        case 'upgrade':
        case 'tool':
            $SM.add('stores["'+thing+'"]', 1);
            break;
        case 'building':
            $SM.add('game.buildings["'+thing+'"]', 1);
            break;
        }        
    },
    
    needsWorkshop: function(type) {
        return type == 'weapon' || type == 'upgrade' || type =='tool';
    },
    
    craftUnlocked: function(thing) {
        if(Room.buttons[thing]) {
            return true;
        }
        if($SM.get('game.builder.level') < 4) return false;
        var craftable = Room.Craftables[thing];
        if(Room.needsWorkshop(craftable.type) && $SM.get('game.buildings["'+'workshop'+'"]', true) === 0) return false;
        var cost = craftable.cost();
        
        //show button if one has already been built
        if($SM.get('game.buildings["'+thing+'"]') > 0){
            Room.buttons[thing] = true;
            return true;
        }
        // Show buttons if we have at least 1/2 the wood, and all other components have been seen.
        if($SM.get('stores.wood', true) < cost['wood'] * 0.75) {
            return false;
        }
        for(var c in cost) {
            if(!$SM.get('stores["'+c+'"]')) {
                return false;
            }
        }
        
        Room.buttons[thing] = true;
        //don't notify if it has already been built before
        if(!$SM.get('game.buildings["'+thing+'"]')){
            Notifications.notify(Room, craftable.availableMsg);
        }
        return true;
    },
    
    buyUnlocked: function(thing) {
        if(Room.buttons[thing]) {
            return true;
        } else if($SM.get('game.buildings["trading post"]', true) > 0) {
            if(thing == 'compass' || typeof $SM.get('stores["'+thing+'"]') != 'undefined') {
                // Allow the purchase of stuff once you've seen it
                return true;
            }
        }
        return false;
    },
    
    updateBuildButtons: function() {
        var buildSection = $('#buildBtns');
        var needsAppend = false;
        if(buildSection.length === 0) {
            buildSection = $('<div>').attr({'id': 'buildBtns', 'data-legend': _('build:')}).css('opacity', 0);
            needsAppend = true;
        }
        
        var craftSection = $('#craftBtns');
        var cNeedsAppend = false;
        if(craftSection.length === 0 && $SM.get('game.buildings["workshop"]', true) > 0) {
            craftSection = $('<div>').attr({'id': 'craftBtns', 'data-legend': _('craft:')}).css('opacity', 0);
            cNeedsAppend = true;
        }
        
        var buySection = $('#buyBtns');
        var bNeedsAppend = false;
        if(buySection.length === 0 && $SM.get('game.buildings["trading post"]', true) > 0) {
            buySection = $('<div>').attr({'id': 'buyBtns', 'data-legend': _('buy:')}).css('opacity', 0);
            bNeedsAppend = true;
        }

        if ($SM.get('game.buildings["workshop"]', true) > 0 && !('brick'in $SM.get("stores"))) {
            $SM.set('stores.brick', 0)
            Outside.updateBrickButton();
        }
        
        for(var k in Room.Craftables) {
            craftable = Room.Craftables[k];
            var max = $SM.num(k, craftable) + 1 > craftable.maximum;
            if(craftable.button == null) {
                if(Room.craftUnlocked(k)) {
                    var loc = Room.needsWorkshop(craftable.type) ? craftSection : buildSection;
                    craftable.button = new Button.Button({
                        id: 'build_' + k,
                        cost: craftable.cost(),
                        text: _(k),
                        click: Room.build,
                        width: '80px',
                        ttPos: loc.children().length > 10 ? 'top right' : 'bottom right'
                    }).css('opacity', 0).attr('buildThing', k).appendTo(loc).animate({opacity: 1}, 300, 'linear');
                }
            } else {
                // refresh the tooltip
                var costTooltip = $('.tooltip', craftable.button);
                costTooltip.empty();
                var cost = craftable.cost();
                for(var c in cost) {
                    $("<div>").addClass('row_key').text(_(c)).appendTo(costTooltip);
                    $("<div>").addClass('row_val').text(cost[c]).appendTo(costTooltip);
                }
                if(max && !craftable.button.hasClass('disabled')) {
                    Notifications.notify(Room, craftable.maxMsg);
                }
            }
            if(max) {
                Button.setDisabled(craftable.button, true);
            } else {
                Button.setDisabled(craftable.button, false);
            }
        }
        
        for(var g in Room.TradeGoods) {
            good = Room.TradeGoods[g];
            var goodsMax = $SM.num(g, good) + 1 > good.maximum;
            if(good.button == null) {
                if(Room.buyUnlocked(g)) {
                    good.button = new Button.Button({
                        id: 'build_' + g,
                        cost: good.cost(),
                        text: _(g),
                        click: Room.buy,
                        width: '80px',
                        ttPos: buySection.children().length > 10 ? 'top right' : 'bottom right'
                    }).css('opacity', 0).attr('buildThing', g).appendTo(buySection).animate({opacity:1}, 300, 'linear');
                }
            } else {
                // refresh the tooltip
                var goodsCostTooltip = $('.tooltip', good.button);
                goodsCostTooltip.empty();
                var goodCost = good.cost();
                for(var gc in goodCost) {
                    $("<div>").addClass('row_key').text(_(gc)).appendTo(goodsCostTooltip);
                    $("<div>").addClass('row_val').text(goodCost[gc]).appendTo(goodsCostTooltip);
                }
                if(goodsMax && !good.button.hasClass('disabled')) {
                    Notifications.notify(Room, good.maxMsg);
                }
            }
            if(goodsMax) {
                Button.setDisabled(good.button, true);
            } else {
                Button.setDisabled(good.button, false);
            }
        }
        
        if(needsAppend && buildSection.children().length > 0) {
            buildSection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
        }
        if(cNeedsAppend && craftSection.children().length > 0) {
            craftSection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
        }
        if(bNeedsAppend && buildSection.children().length > 0) {
            buySection.appendTo('div#roomPanel').animate({opacity: 1}, 300, 'linear');
        }
    },
    
    compassTooltip: function(direction){
        var ttPos = $('div#resources').children().length > 10 ? 'top right' : 'bottom right';
        var tt = $('<div>').addClass('tooltip ' + ttPos);
        $('<div>').addClass('row_key').text(_('the compass points '+ direction)).appendTo(tt);
        tt.appendTo($('#row_compass'));
    },
    
    handleStateUpdates: function(e){
        if(e.category == 'stores'){
            Room.updateStoresView();
            Room.updateBuildButtons();
        } else if(e.category == 'income'){
            Room.updateStoresView();
            Room.updateIncomeView();
        } else if(e.stateName.indexOf('game.buildings') === 0){
            Room.updateBuildButtons();
        }
    }
};
