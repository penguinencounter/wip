// Monke: A quick and dirty library for mixing functions together.


let Monke = {
    mix: function(...mixins) {
        return function(...args) {
            for (let mixin of mixins) {
                mixin.apply(this, args);
            }
        };
    }
}
export default Monke;
