
export const damage_types = ["Acid", "Cold", "Energy", "Fire", "Force", "Ion", "Kinetic", "Lightning", "Necrotic", "Poison", "Psychic", "Sonic"]

export const stats = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]

export const ammo_types = ["Slug", "Power Cell", "Arrow", "Dart", "Cannister", "Rocket", "Missile", "Flechette"]

export class WeaponPlan {
    constructor(
        public damage_type: string = ""
    ) {}
}