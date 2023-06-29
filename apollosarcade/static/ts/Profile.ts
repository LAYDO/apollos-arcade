 export class Profile {
    private app: Element;
    private data: any;
    
    private profile: HTMLElement;
    private banner: HTMLElement;
    private profileWrapper: HTMLElement;
    private avatarWrapper: HTMLElement;
    private avatar: HTMLElement;
    
    private detailsWrapper: HTMLElement;
    private nameWrapper: HTMLElement;
    private title: HTMLElement;
    private name: HTMLElement;
    private location: HTMLElement;
    private bio: HTMLElement;
    private stats: HTMLElement;
     
     private profileActions: HTMLElement;
     
     private editButton: HTMLElement;

     private url: string;

    constructor(app: Element, data: HTMLElement) {
        this.app = app;
        this.data = data.dataset;
        this.url = `${window.location.protocol}//${window.location.host}/static/images/`;
        let root = document.documentElement;
        root.style.setProperty('--banner-url', `url('${this.url}${this.data.banner}')`);
        root.style.setProperty('--avatar-url', `url('${this.url}${this.data.avatar}')`);

        this.profile = document.createElement('div');
        this.profile.classList.add('profile');
        this.profile.classList.add('flex');

        this.banner = document.createElement('div');
        this.banner.classList.add('banner');
        // this.banner.style.backgroundImage = `url('${this.url}${this.data.banner}')`;

        this.profileWrapper = document.createElement('div');
        this.profileWrapper.classList.add('profile-wrapper');
        this.profileWrapper.classList.add('flex');

        this.avatarWrapper = document.createElement('div');
        this.avatarWrapper.classList.add('avatar-wrapper');

        this.avatar = document.createElement('div');
        this.avatar.classList.add('avatar');
        // this.avatar.style.backgroundImage = `url('${this.url}${this.data.avatar}')`;

        this.detailsWrapper = document.createElement('div');
        this.detailsWrapper.classList.add('details-wrapper');

        this.nameWrapper = document.createElement('div');
        this.nameWrapper.classList.add('name-wrapper');

        this.title = document.createElement('h2');
        this.title.innerText = `${this.data.username}`;

        this.name = document.createElement('div');
        this.name.classList.add('name');
        this.name.innerText = `${this.data.firstName} ${this.data.lastName}`;

        this.location = document.createElement('div');
        this.location.classList.add('location');
        this.location.innerText = `${this.data.location}`;
        
        this.bio = document.createElement('div');
        this.bio.classList.add('bio');
        this.bio.innerText = `${this.data.bio}`;

        let m15Stats = JSON.parse(this.data.m15Stats);
        this.stats = document.createElement('p');
        this.stats.innerText = `Stats:\nTotal Games: ${m15Stats.total_games}\nTotal Wins: ${m15Stats.total_wins}\nWin Rate: ${((m15Stats['total_wins'] / m15Stats['total_games']) * 100).toFixed(2)}%`;

        this.profileActions = document.createElement('div');
        this.profileActions.classList.add('profile-actions');

        this.editButton = document.createElement('button');
        this.editButton.classList.add('edit-button');
        this.editButton.classList.add('fa-solid');
        this.editButton.classList.add('fa-pencil');
        this.editButton.addEventListener('click', () => {
            window.location.href += 'edit/';
        });
        
        this.nameWrapper.appendChild(this.title);
        this.nameWrapper.appendChild(this.name);
        this.nameWrapper.appendChild(this.location);
        this.nameWrapper.appendChild(this.bio);
        this.nameWrapper.appendChild(this.stats);

        this.avatarWrapper.appendChild(this.avatar);

        this.profileActions.appendChild(this.editButton);

        this.detailsWrapper.appendChild(this.nameWrapper);
        this.detailsWrapper.appendChild(this.profileActions);

        this.profileWrapper.appendChild(this.avatarWrapper);
        this.profileWrapper.appendChild(this.detailsWrapper);

        this.profile.appendChild(this.banner);
        this.profile.appendChild(this.profileWrapper);

        this.app.appendChild(this.profile);
    }
 }