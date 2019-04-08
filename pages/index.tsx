import React from 'react'
import {
    Image,
    Icon,
    Tab,
    Menu,
    Container,
    Grid,
    Item,
    MenuItemProps,
    Header,
    Responsive
} from 'semantic-ui-react'
import { experiences, educations } from '../data'

const panes = [
    {
        menuItem: 'Experience',
        render: () => (
            <Tab.Pane attached={false}>
                <Item.Group>
                    {experiences.map(e => (
                        <Item>
                            <Item.Content>
                                <Item.Header>{e.company}</Item.Header>
                                <Item.Meta>
                                    {e.position}, {e.start}
                                    {e.end && ' - ' + e.end}
                                </Item.Meta>
                                <Item.Description>
                                    {e.description}
                                </Item.Description>
                                <Item.Extra>
                                    {e.projects.map(p => (
                                        <ul>
                                            <li>{p.description}</li>
                                            <ul>
                                                {p.responsibilities.map(r => (
                                                    <li>{r}</li>
                                                ))}
                                            </ul>
                                        </ul>
                                    ))}
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                    ))}
                </Item.Group>
            </Tab.Pane>
        )
    },
    {
        menuItem: 'Education',
        render: () => (
            <Tab.Pane attached={false}>
                <Item.Group>
                    {educations.map(e => (
                        <Item>
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
                                        {e.achievements.map(a => (
                                            <li
                                                dangerouslySetInnerHTML={{
                                                    __html: a
                                                }}
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
        )
    }
]

export default class extends React.Component {
    public state = { activeItem: 'profile' }

    private handleItemClick = (_: React.MouseEvent, { name }: MenuItemProps) =>
        this.setState({ activeItem: name })

    public render() {
        const { activeItem } = this.state
        return (
            <div>
                <Menu>
                    <Menu.Item
                        name="profile"
                        active={activeItem === 'profile'}
                        onClick={this.handleItemClick}
                    >
                        Profile
                    </Menu.Item>

                    <Menu.Item
                        name="blog"
                        active={activeItem === 'blog'}
                        onClick={this.handleItemClick}
                    >
                        Blog
                    </Menu.Item>
                </Menu>

                <Container text>
                    <Grid celled>
                        <Grid.Row>
                            <Grid.Column mobile={5} computer={5}>
                                <Image src="/static/wildan_ganteng.jpg" />
                            </Grid.Column>
                            <Grid.Column mobile={11} computer={11}>
                                <Header as="h1">
                                    Wildan Maulana Syahidillah
                                </Header>
                                <Header.Subheader>
                                    Software Developer
                                </Header.Subheader>
                                <div style={{ fontSize: '14px' }}>
                                    Full-stack developer who is motivated by
                                    ideas and knowledge.
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column mobile={16} computer={5}>
                                <Header as="h3">Basic Info</Header>
                                <div>
                                    <Icon name="globe" />
                                    <span>Malang, Indonesia</span>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <Icon name="birthday cake" />
                                    <span>23 Years Old</span>
                                </div>
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
                </Container>
            </div>
        )
    }
}
