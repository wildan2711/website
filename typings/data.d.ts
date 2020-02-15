interface JobProject {
    description: string;
    responsibilities?: string[];
}

interface Experience {
    company: string;
    position: string;
    start: string | number;
    end: string | number | null;
    description?: string;
    projects: JobProject[];
}

interface Education {
    institute: string;
    instituteLink: string;
    major: string;
    start: string | number;
    end: string | number | null;
    achievements: string[];
}

interface Project {
    name: string;
    description: string;
    languages: string[];
    link: string;
}

interface Profile {
    name: string;
    picture: string;
    position: string;
    description: string;
    email?: string;
    linkedin?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
}

interface Info {
    id: string;
    icon: string | any;
    text: string;
}

interface Skill {
    skill: string;
    icon?: string | any;
    iconSrc?: string;
    percent: number;
    link?: string;
    color?: string | any;
}

interface SkillsByPercent {
    [percent: number]: Skill[];
}

interface Post {
    id: number;
    title: string;
    created: string;
    text: string;
}
