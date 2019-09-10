class HighScore extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style) {
        super(scene, x, y, text, style);

        scene.add.existing(this);

        this.score = 0;
    }


}