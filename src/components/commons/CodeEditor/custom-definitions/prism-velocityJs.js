 import Prism from "prismjs";
import "prismjs/components/prism-velocity";

(function (Prism) {
    Prism.languages.velocityJs = Prism.languages.extend('velocity', {});
    const velocity = Prism.languages.velocity;
    Prism.languages.velocityJs.variable = [
        {...velocity.variable},
        {
            pattern: /^[^/#](\w+\b)(\.\w+\b)*/,
            // lookbehind: true,
            inside: velocity.variable.inside
        }
    ]
}(Prism));
