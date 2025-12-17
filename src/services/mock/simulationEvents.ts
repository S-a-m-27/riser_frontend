export interface Decision {
    id: string;
    label: string;
    impactStress: number; // -10 to +10
    impactMorale: number; // -10 to +10
    timeCost: number; // seconds
}

export interface SimulationEvent {
    id: number;
    sceneImage: string; // placeholder for now
    eventTitle: string;
    eventIcon: string; // icon name
    description?: string;
    decisions: Decision[];
}

export const mockSimulationEvents: SimulationEvent[] = [
    {
        id: 1,
        sceneImage: 'flood-scene-1',
        eventTitle: 'The water level is rising rapidly',
        eventIcon: 'Droplets',
        description: 'Water has started entering your home. You need to act quickly.',
        decisions: [
            {
                id: 'evacuate-now',
                label: 'Evacuate immediately to higher ground',
                impactStress: -5,
                impactMorale: 5,
                timeCost: 15,
            },
            {
                id: 'gather-supplies',
                label: 'Quickly gather essential supplies first',
                impactStress: 5,
                impactMorale: -3,
                timeCost: 20,
            },
            {
                id: 'wait-observe',
                label: 'Wait and observe the situation',
                impactStress: 10,
                impactMorale: -5,
                timeCost: 10,
            },
        ],
    },
    {
        id: 2,
        sceneImage: 'flood-scene-2',
        eventTitle: 'Power outage detected',
        eventIcon: 'Zap',
        description: 'The electricity has gone out. You need to decide how to proceed.',
        decisions: [
            {
                id: 'use-flashlight',
                label: 'Use flashlight and continue',
                impactStress: -3,
                impactMorale: 2,
                timeCost: 5,
            },
            {
                id: 'find-candles',
                label: 'Search for candles and matches',
                impactStress: 2,
                impactMorale: 1,
                timeCost: 12,
            },
            {
                id: 'stay-dark',
                label: 'Stay in the dark to conserve resources',
                impactStress: 5,
                impactMorale: -3,
                timeCost: 8,
            },
        ],
    },
    {
        id: 3,
        sceneImage: 'flood-scene-3',
        eventTitle: 'Neighbor needs help',
        eventIcon: 'Users',
        description: 'A neighbor is calling for assistance. What do you do?',
        decisions: [
            {
                id: 'help-neighbor',
                label: 'Help the neighbor immediately',
                impactStress: 3,
                impactMorale: 8,
                timeCost: 25,
            },
            {
                id: 'assess-first',
                label: 'Assess the situation first before helping',
                impactStress: -2,
                impactMorale: 3,
                timeCost: 15,
            },
            {
                id: 'prioritize-self',
                label: 'Prioritize your own safety first',
                impactStress: -5,
                impactMorale: -5,
                timeCost: 5,
            },
        ],
    },
    {
        id: 4,
        sceneImage: 'flood-scene-4',
        eventTitle: 'Emergency services contact',
        eventIcon: 'Phone',
        description: 'Emergency services are trying to reach you. How do you respond?',
        decisions: [
            {
                id: 'answer-call',
                label: 'Answer the call and follow instructions',
                impactStress: -8,
                impactMorale: 10,
                timeCost: 30,
            },
            {
                id: 'send-location',
                label: 'Send your location via text message',
                impactStress: -5,
                impactMorale: 7,
                timeCost: 20,
            },
            {
                id: 'ignore-call',
                label: 'Ignore the call and continue',
                impactStress: 5,
                impactMorale: -8,
                timeCost: 5,
            },
        ],
    },
    {
        id: 5,
        sceneImage: 'flood-scene-5',
        eventTitle: 'Final evacuation decision',
        eventIcon: 'MapPin',
        description: 'You must make a final decision about evacuation. Time is critical.',
        decisions: [
            {
                id: 'evacuate-safe',
                label: 'Evacuate to the designated safe zone',
                impactStress: -10,
                impactMorale: 10,
                timeCost: 40,
            },
            {
                id: 'stay-shelter',
                label: 'Stay and seek higher shelter in building',
                impactStress: 5,
                impactMorale: -5,
                timeCost: 20,
            },
            {
                id: 'wait-rescue',
                label: 'Wait for rescue team',
                impactStress: 8,
                impactMorale: -8,
                timeCost: 60,
            },
        ],
    },
];







