export const damage_types = ["Acid", "Cold", "Energy", "Fire", "Force", "Ion", "Kinetic", "Lightning", "Necrotic", "Poison", "Psychic", "Sonic"];
export const stats = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
export class WeaponPlan {
    constructor(damage_type = "") {
        this.damage_type = damage_type;
    }
}
