function animations(scene) {
    let config = {
        key: 'left',
        frames: scene.anims.generateFrameNumbers('mouse', {prefix: 'walk/left',start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    };
    scene.anims.create(config);

    config = {
        key: 'leftStop',
        frames: scene.anims.generateFrameNumbers('mouse', {prefix: 'walk/leftStop',start: 3, end: 3}),
        frameRate: 20
    };
    scene.anims.create(config);

    config = {
        key: 'rightStop',
        frames: scene.anims.generateFrameNumbers('mouse', {prefix: 'walk/rightStop',start: 7, end: 7}),
        frameRate: 20
    };
    scene.anims.create(config);

    config = {
        key: 'right',
        frames: scene.anims.generateFrameNumbers('mouse', {prefix: 'walk/right',start: 4, end: 7}),
        frameRate: 10,
        repeat: -1
    };
    scene.anims.create(config);

    config = {
        key: 'stand',
        frames: [{key: 'mouse', frame: 3}],
        frameRate: 0
    };
    scene.anims.create(config);

    config = {
        key: 'left_stupid_cat',
        frames: scene.anims.generateFrameNumbers('stupid_cat', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    };
    scene.anims.create(config);

    config = {
        key: 'right_stupid_cat',
        frames: scene.anims.generateFrameNumbers('stupid_cat', {start: 4, end: 7}),
        frameRate: 10,
        repeat: -1
    };
    scene.anims.create(config);
}
