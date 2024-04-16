const node = "savedplans";
export class SavedBuild {
    constructor(name = "My Saved Build", data = "") {
        this.name = name;
        this.data = data;
    }
    save() {
        const builds = SavedBuild.load();
        builds[this.name] = this;
        localStorage.setItem(node, JSON.stringify(builds));
    }
    static load() {
        const savedBuildData = JSON.parse(localStorage.getItem(node) || "{}");
        var savedBuilds = {};
        for (const name in savedBuildData) {
            const build = savedBuildData[name];
            savedBuilds[name] = new SavedBuild(name, build.data);
        }
        return savedBuilds;
    }
    static import() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');
        const planName = document.getElementById("plan-name");
        if (encodedData) {
            const data = decodeURIComponent(encodedData);
            try {
                const parsedData = JSON.parse(data);
                const value = JSON.stringify(parsedData.name || "");
                planName.value = JSON.stringify(parsedData.name || "").replace(/\"/g, "");
            }
            catch (error) {
                console.error("Error parsong plan data: ", error);
            }
        }
    }
    static dump(name) {
        const plans = SavedBuild.load();
        for (const n in plans) {
            if (name == n) {
                delete plans[name];
                localStorage.setItem(node, JSON.stringify(plans));
                break;
            }
        }
    }
}
