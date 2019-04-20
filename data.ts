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
];

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
];

export const projects: Project[] = [
    {
        name: 'Dolan',
        description:
            'A sports social media platform allowing users find teammates to play sports.',
        languages: ['Go', 'Vue', 'Nuxt', 'Dgraph'],
        link: 'https://dolan.in'
    },
    {
        name: 'Dgman',
        description:
            'Dgman is a schema manager for Dgraph using the Go Dgraph client (dgo), which manages Dgraph schema and indexes from Go tags in struct definitions. It also provides query, mutate, and delete helpers for easier data operations.',
        languages: ['Go', 'Dgraph'],
        link: 'https://github.com/dolan-in/dgman'
    },
    {
        name: 'MQTT Android Tutorial',
        description: 'A tutorial for using the MQTT Android service.',
        languages: ['Java', 'Android'],
        link: 'https://github.com/wildan2711/mqtt-android-tutorial'
    }
];

export const profile: Profile = {
    name: 'Wildan Maulana Syahidillah',
    picture: '/static/wildan_ganteng.jpg',
    position: 'Software Developer',
    description:
        'Full-stack developer who is motivated by ideas and knowledge.',
    email: 'wildan2711@gmail.com',
    linkedin: 'https://www.linkedin.com/in/wildan-syahidillah-a83990128/',
    facebook: 'https://www.facebook.com/wildan2711',
    instagram: 'https://www.instagram.com/wsyahidillah/'
};

export const info: Info[] = [
    {
        id: 'location',
        icon: 'globe',
        text: 'Malang, Indonesia'
    },
    {
        id: 'age',
        icon: 'birthday cake',
        text: '23 Years Old'
    }
];

export const skills: Skill[] = [
    {
        skill: 'VueJS',
        icon: 'vuejs',
        percent: 80,
        link: 'https://vuejs.org',
        color: 'green'
    },
    {
        skill: 'Golang',
        iconSrc: '/static/Go-Logo_Aqua.svg',
        percent: 80,
        link: 'https://golang.org/'
    },
    {
        skill: 'Typescript',
        iconSrc: '/static/typescript.png',
        percent: 75,
        link: 'https://www.typescriptlang.org/',
        color: 'blue'
    },
    {
        skill: 'Angular',
        icon: 'angular',
        percent: 65,
        link: 'https://angular.io/',
        color: 'red'
    },
    {
        skill: 'Python',
        icon: 'python',
        percent: 65,
        link: 'https://www.python.org/',
        color: 'blue'
    },
    {
        skill: 'Docker',
        icon: 'docker',
        percent: 75,
        link: 'https://docker.com/',
        color: 'blue'
    },
    {
        skill: 'Ionic',
        iconSrc: '/static/ionic.png',
        percent: 50,
        link: 'https://ionicframework.com/'
    },
    {
        skill: 'React',
        icon: 'react',
        percent: 50,
        link: 'https://reactjs.org/',
        color: 'blue'
    },
    {
        skill: 'Amazon Web Services',
        icon: 'aws',
        percent: 60,
        link: 'https://aws.amazon.com',
        color: 'orange'
    },
    {
        skill: 'Azure',
        iconSrc: '/static/azure.png',
        percent: 50,
        link: 'https://azure.microsoft.com'
    },
    {
        skill: 'Google Cloud Platform',
        iconSrc: '/static/gcp.png',
        percent: 50,
        link: 'https://cloud.google.com/'
    },
    {
        skill: 'Rust',
        iconSrc: '/static/rust.svg',
        percent: 40,
        link: 'https://www.rust-lang.org/'
    },
    {
        skill: 'Postgres',
        iconSrc: '/static/postgres.png',
        percent: 80,
        link: 'https://www.postgresql.org/'
    },
    {
        skill: 'MongoDB',
        iconSrc: '/static/mongodb.png',
        percent: 60,
        link: 'https://www.mongodb.com/'
    },
    {
        skill: 'Dgraph',
        iconSrc: '/static/dgraph.jpg',
        percent: 75,
        link: 'https://dgraph.io/'
    },
    {
        skill: 'ASP.NET Core',
        iconSrc: '/static/netcore.png',
        percent: 40,
        link: 'https://dotnet.microsoft.com/'
    }
];
