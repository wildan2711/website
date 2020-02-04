import React from 'react';
import {
    Image,
    Icon,
    List,
    Tab,
    Grid,
    Item,
    Header,
    Progress,
    Popup
} from 'semantic-ui-react';
import Head from 'next/head';
import {
    experiences,
    educations,
    profile,
    info,
    projects,
    skills
} from '../data';

const TabExperience = () => (
    <Tab.Pane attached={false}>
        <Item.Group>
            {experiences.map((e, i) => (
                <Item key={i}>
                    <Item.Content>
                        <Item.Header>{e.company}</Item.Header>
                        <Item.Meta>
                            {e.position}, {e.start}
                            {e.end && ' - ' + e.end}
                        </Item.Meta>
                        <Item.Description>{e.description}</Item.Description>
                        <Item.Extra>
                            <ul>
                                {e.projects.map((p, i) => (
                                    <li key={i}>
                                        {p.description}
                                        <ul>
                                            {p?.responsibilities?.map(
                                                (r, j) => (
                                                    <li key={j}>{r}</li>
                                                )
                                            )}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </Item.Extra>
                    </Item.Content>
                </Item>
            ))}
        </Item.Group>
    </Tab.Pane>
);

const TabProjects = () => (
    <Tab.Pane attached={false}>
        <Item.Group>
            {projects.map((e, i) => (
                <Item key={i}>
                    <Item.Content>
                        <Item.Header as="a" href={e.link}>
                            {e.name}
                        </Item.Header>
                        <Item.Meta>{e.languages.join(', ')}</Item.Meta>
                        <Item.Description>{e.description}</Item.Description>
                        <Item.Extra />
                    </Item.Content>
                </Item>
            ))}
        </Item.Group>
    </Tab.Pane>
);

const TabEducation = () => (
    <Tab.Pane attached={false}>
        <Item.Group>
            {educations.map((e, i) => (
                <Item key={i}>
                    <Item.Content>
                        <Item.Header as="a" href={e.instituteLink}>
                            {e.institute}
                        </Item.Header>
                        <Item.Meta>
                            {e.major}
                            {e.major && ','} {e.start} - {e.end}
                        </Item.Meta>
                        <Item.Description>
                            <ul>
                                {e.achievements.map((a, i) => (
                                    <li
                                        dangerouslySetInnerHTML={{
                                            __html: a
                                        }}
                                        key={i}
                                    />
                                ))}
                            </ul>
                        </Item.Description>
                        <Item.Extra />
                    </Item.Content>
                </Item>
            ))}
        </Item.Group>
    </Tab.Pane>
);

const panes = [
    {
        menuItem: 'Experience',
        render: TabExperience
    },
    {
        menuItem: 'Projects',
        render: TabProjects
    },
    {
        menuItem: 'Education',
        render: TabEducation
    }
];

const skillsTemplate = ([percent, skills]: [string, Skill[]]) => (
    <div key={percent}>
        <div>
            {skills.map(s => {
                let trigger = (
                    <Image
                        src={s.iconSrc}
                        href={s.link}
                        target="_blank"
                        size="mini"
                        style={{ padding: '4px' }}
                    />
                );
                if (s.icon) {
                    trigger = (
                        <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Icon
                                aria-label={s.skill}
                                name={s.icon}
                                color={s.color}
                                size="large"
                                link
                            />
                        </a>
                    );
                }

                return (
                    <Popup key={s.skill} trigger={trigger} content={s.skill} />
                );
            })}
        </div>
        <Progress percent={percent} size="tiny" indicating />
    </div>
);

function groupSkill(skills: Skill[]): [string, Skill[]][] {
    const byPercent: SkillsByPercent = skills.reduce(
        (res: SkillsByPercent, s: Skill) => {
            if (!res[s.percent]) {
                res[s.percent] = [];
            }
            res[s.percent].push(s);
            return res;
        },
        {}
    );

    return Object.entries(byPercent).sort(
        (a: [string, Skill[]], b: [string, Skill[]]) =>
            Number(b[0]) - Number(a[0])
    );
}

const Profile = () => (
    <Grid celled>
        <Head>
            <title>Profile | Wildan Maulana Syahidillah</title>
        </Head>
        <Grid.Row>
            <Grid.Column mobile={5} computer={5}>
                <Image src={profile.picture} />
            </Grid.Column>
            <Grid.Column mobile={11} computer={11} verticalAlign="bottom">
                <Header as="h1">{profile.name}</Header>
                <Header.Subheader>{profile.position}</Header.Subheader>
                <div style={{ fontSize: '14px' }}>{profile.description}</div>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column mobile={16} computer={5}>
                <Header as="h3">Basic Info</Header>
                <List>
                    {info.map(i => (
                        <List.Item key={i.id}>
                            <List.Icon name={i.icon} />
                            <List.Content>{i.text}</List.Content>
                        </List.Item>
                    ))}
                </List>
                <Header as="h3">Skills</Header>
                {groupSkill(skills).map(skillsTemplate)}
            </Grid.Column>
            <Grid.Column mobile={16} computer={11}>
                <Tab
                    menu={{ secondary: true, pointing: true }}
                    panes={panes}
                    style={{ marginTop: '16px' }}
                />
            </Grid.Column>
        </Grid.Row>
    </Grid>
);

export default Profile;
