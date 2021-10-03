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
        if (!morph_details) morph_details = {morph_type:"Biomorph", maximum_durability:1};
        let type = morph_details.morph_type;
        let dur = morph_details.maximum_durability;
        console.log(app);

        let bselected = "";
        let pselected = "";
        let sselected = "";
        let iselected = "";

        let enabled;

        if (app.document.isOwner) enabled = `enabled = "enabled"`;
        if (!app.document.isOwner) enabled = `disabled = "disabled"`;

        if (type == "Biomorph") bselected = 'selected = selected';
        if (type == "Pod") pselected = 'selected = selected';
        if (type == "Synthmorph") sselected = 'selected = selected';
        if (type == "Infomorph") iselected = 'selected = selected';

        let calc_dur = "";
        if (app.actor && app.actor.type!="Thing" && app.actor.isOwner) calc_dur=`<button type="button" style="background-color:white; height:25px; width:35px" i icon class = "fas fa-calculator fco-thf-calc_dur" title="Calculate Durabilty" data-uuid="${app.object.uuid}"></button>`

        $('div[class="fco-extra-r"]').after(
            `
                <strong>Morph Type:</strong> <select type="text" ${enabled} class="fco-thf-morph_type" data-uuid="${app.object.uuid}" style="background-color:white">
                                <option ${bselected} value="Biomorph">Biomorph</option>
                                <option ${pselected} value="Pod">Pod</option>
                                <option ${sselected} value="Synthmorph">Synthmorph</option>
                                <option ${iselected} value="Infomorph">Infomorph</option>
                            </select>
                <strong style="padding-left:20px">Max Durability:</strong> <input ${enabled} data-uuid="${app.object.uuid}" type="number" class="fco-thf-max_durability" value="${dur}" style="background-color:white; max-width:4rem"></input>
                ${calc_dur}
            `);
        $('div[class="fco-extra-r"]').remove();
    }
 })

Hooks.once("ready", async () => {
    $(document).on('change', '.fco-thf-morph_type',async event => {
        let item = await fromUuid(event.target.getAttribute("data-uuid"));
        let morph_details = item.getFlag("fco-thf","morph_details");
        if (!morph_details) morph_details = {morph_type:"Biomorph", maximum_durability:1};
        morph_details.morph_type = event.target.value;
        await item.setFlag("fco-thf", "morph_details", morph_details)
    });
    
    $(document).on('change', '.fco-thf-max_durability',async event => {
        let item = await fromUuid(event.target.getAttribute("data-uuid"));
        let morph_details = item.getFlag("fco-thf","morph_details");
        if (!morph_details) morph_details = {morph_type:"Biomorph", maximum_durability:1};
        morph_details.maximum_durability = event.target.value;
        await item.setFlag("fco-thf", "morph_details", morph_details)
    });

    $(document).on('click', '.fco-thf-calc_dur',async event => 
    {
        let item = await fromUuid (event.target.getAttribute("data-uuid"));
        let morph_details = item.getFlag("fco-thf","morph_details");
        
        if (!morph_details) morph_details = {morph_type:"Bio", maximum_durability:1};
        
        let morph_type = morph_details.morph_type;
        let maximum_durability = morph_details.maximum_durability;

        let dur = item.data.data.skills["Durability"];

        if (!dur) {
            dur = {"name":"Durability","rank":morph_details.maximum_durability, "description":"","overcome":"","caa":"","attack":"","defend":"","pc":true}
        } else {
            dur = duplicate(dur);
        }

        if (morph_type == "Synthmorph" || morph_type == "Infomorph"){
            dur.rank = parseInt(maximum_durability);
        }

        if (morph_type == "Pod" || morph_type == "Biomorph"){
            let somatics = parseInt(item.actor.data.data.skills["Somatics"].rank);
            if (somatics < maximum_durability) dur.rank = somatics;
            if (somatics > maximum_durability) dur.rank = parseInt(maximum_durability);
        }
        await item.update({"data.skills":{["Durability"]:dur}});
    })
})