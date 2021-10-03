// This only appends the bits I want once, replacing an empty DIV I've stashed on the sheet.
// We'll need to make sure that these two new fields have the necessary data, and set up listeners to do the manipulation of the data stored in flags.
// We can also ensure this only triggers for any Extra with Morph in its name.
// It only triggers when an extra sheet is rendered, which is useful
// Can get the item that was rendered with app.document, so can get app.document.id
// Can obviously use this to get the right info to the listeners - Can just use the link directly to app.document and then call updates directly on that.
// We may also need to give the parent ID, if there is one, with app.document.parent.id

Hooks.on("renderExtraSheet", (app, html) => {
    if (app.document.name.toLowerCase().startsWith("morph")){

        let morph_details = app.document.getFlag("fco-thf","morph_details");
        if (!morph_details) morph_details = {type:"Biomorph", maximum_durability:1};
        let type = morph_details.morph_type;
        let dur = morph_details.maximum_durability;

        $('div[class="fco-extra-r"]').after(
            `
                Morph Type: <select type="text">
                                <option>Biomorph</option>
                                <option>Pod</option>
                                <option>Synth</option>
                            </select>
            `);
        $('div[class="fco-extra-r"]').remove();
    }
 })