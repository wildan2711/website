export const experiences: Experience[] = [
    {
        company: 'PT WJA',
        position: 'Software Developer',
        start: 2018,
        end: 'present',
        description:
            'Responsible for full-stack development of web applications and basic DevOps and System Administration tasks.',
        projects: [
            {
                description:
                    'Government Geophysical Monitoring Project, co-developed GIS web application for displaying and monitoring construction progress.',
                responsibilities: [
                    'Full-stack development with VueJS, Golang, and PostgreSQL.',
                    'GIS development, integration with Google Maps with PostGIS geodata storage and processing.',
                    'DevOps and system administration in AWS cloud.'
                ]
            },
            {
                description:
                    'Development of internal frontend framework using VueJS.',
                responsibilities: []
            }
        ]
    },
    {
        company: 'Freelance',
        position: 'Software Developer',
        start: 2018,
        end: null,
        description:
            'Developed culinary race web application using VueJS, Golang, and PostgreSQL.',
        projects: []
    },
    {
        company: 'Freelance',
        position: 'Software Developer',
        start: 2017,
        end: null,
        description:
            'Developed CBIC (Corporate Banking Information Center) hybrid mobile application using Ionic 2.',
        projects: []
    },
    {
        company: 'PT Magicsoft Asia Systems',
        position: 'Software Developer',
        start: 2017,
        end: 2018,
        description:
            'Responsible for full-stack development of web applications.',
        projects: [
            {
                description:
                    'Hospital/Clinic Management System, developed web management system for patient monitoring of hospitals/clinics.',
                responsibilities: [
                    'Full-stack development with VueJS, Golang, and PostgreSQL.'
                ]
            },
            {
                description:
                    'Construction Management System, maintenance and improvement of Construction Permit Management System.',
                responsibilities: [
                    'Bug-fixing, improvements, enhancements of web application using BackboneJS + jQuery, Golang, and MongoDB.'
                ]
            }
        ]
    }
]

export const educations: Education[] = [
    {
        institute: 'Bachelor of Computer Science, Brawijaya University',
        instituteLink: 'http://filkom.ub.ac.id/',
        major: 'Computer Engineering',
        start: 2013,
        end: 2017,
        achievements: [
            'Graduated Cum Laude, with GPA of 3.88.',
            'Finished undergraduate thesis titled "Multipath Routing with Load Balancing", that went on to be published on an &nbsp; <a href="https://www.researchgate.net/publication/328992098_Improving_End-to-End_Network_Throughput_Using_Multiple_Best_Paths_Routing_in_Software_Defined_Networking"> International Conference</a>.',
            'Specialized in Software-Defined Networks, Distributed Systems, and Network Engineering.',
            'Member of Robotics and Computer Systems Laboratory Assistants.',
            'Member of Student Representative Forum.'
        ]
    },
    {
        institute: 'Brawijaya Smart School Senior High',
        instituteLink: 'http://smabss.ub.ac.id/',
        major: 'Science',
        start: 2010,
        end: 2013,
        achievements: [
            'Graduated as school 1st rank with the highest overall school scores.',
            'Finished school 2nd highest in national exam (the 1st was a cheater).',
            'Participated in City Mathematics Olimpiad.',
            'Participated in City Astronomy olimpiad.'
        ]
    },
    {
        institute: 'MTsN Malang 1',
        instituteLink: '',
        major: '',
        start: 2007,
        end: 2010,
        achievements: []
    },
    {
        institute: 'Langford Islamic College',
        instituteLink: '',
        major: '',
        start: 2007,
        end: 2010,
        achievements: []
    }
]
