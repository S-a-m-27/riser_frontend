export interface MisinformationMessage {
    id: number;
    text: string;
    isFalse: boolean;
    explanation: string;
    sender?: string;
    timestamp?: string;
}

export const mockMisinformationMessages: MisinformationMessage[] = [
    {
        id: 1,
        text: "Drink salt water to stay hydrated during a flood.",
        isFalse: true,
        explanation: "Drinking salt water is dangerous and causes dehydration. Always use clean, fresh water.",
        sender: "Unknown",
        timestamp: "10:23 AM",
    },
    {
        id: 2,
        text: "If you see flood water approaching, immediately move to higher ground and follow evacuation orders.",
        isFalse: false,
        explanation: "This is correct advice. Always prioritize safety and follow official evacuation instructions.",
        sender: "Emergency Services",
        timestamp: "10:25 AM",
    },
    {
        id: 3,
        text: "You can drive through flood water if it's less than 6 inches deep.",
        isFalse: true,
        explanation: "Even 6 inches of moving water can sweep away vehicles. Never drive through flooded areas.",
        sender: "Unknown",
        timestamp: "10:27 AM",
    },
    {
        id: 4,
        text: "Turn off electricity at the main breaker if safe to do so before flood water enters your home.",
        isFalse: false,
        explanation: "Correct! Turning off electricity prevents electrical hazards during flooding.",
        sender: "Safety Expert",
        timestamp: "10:30 AM",
    },
    {
        id: 5,
        text: "Flood water is safe to drink after boiling it for 1 minute.",
        isFalse: true,
        explanation: "Flood water may contain harmful chemicals and contaminants. Use bottled or treated water only.",
        sender: "Unknown",
        timestamp: "10:32 AM",
    },
    {
        id: 6,
        text: "Keep an emergency kit with food, water, flashlight, and first aid supplies ready.",
        isFalse: false,
        explanation: "This is excellent advice. An emergency kit is essential for flood preparedness.",
        sender: "Preparedness Guide",
        timestamp: "10:35 AM",
    },
    {
        id: 7,
        text: "You should wait until the last minute to evacuate to protect your belongings.",
        isFalse: true,
        explanation: "Never delay evacuation. Your safety is more important than belongings. Evacuate immediately when warned.",
        sender: "Unknown",
        timestamp: "10:37 AM",
    },
    {
        id: 8,
        text: "Stay away from downed power lines during and after a flood.",
        isFalse: false,
        explanation: "Absolutely correct! Downed power lines are extremely dangerous and can cause electrocution.",
        sender: "Emergency Services",
        timestamp: "10:40 AM",
    },
];








