var App = (function (Ractive) {
'use strict';

Ractive = 'default' in Ractive ? Ractive['default'] : Ractive;

var component$1 = { exports: {} };

component$1.exports = {
	data() {
		return {
			loaded: false,
			type: 'in',
			showPassword: false,
			error: null,
			credentials: {
				username: '',
				password: ''
			}
		};
	},
	oninit() {
		// does a token exist?
		const token = localStorage.token;
		const loaded = () => this.set( 'loaded', true );

		if (token) {
			// is this token valid?
			fetch('/api/auth/validate', {
				method: 'post',
				headers: new Headers({
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				})
			})
			.then(response => {
				if(!response.ok) throw new Error('token was not valid');
				return response.json();
			})
			.then(result => {
				if(!result.valid) throw new Error('token was not valid');
				return this.getUser(token);
			})
			.then(loaded)
			.catch( err => {
				console.log( err );
				localStorage.removeItem('token');
			});
		}
		else loaded(); 
	},
	getUser( token ) {
		const url = '/api/auth/me';
		const headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		});

		return fetch( '/api/users/me', { headers }) 
			.then( res => {
                return res.json().then( body => {
					if( res.status !== 200 ) throw body.error
					body.token = token;
				    this.set( 'user', body );
				});
			});
	},
	submit() {
		this.event.original.preventDefault();
		this.set('error');
		const url = `/api/auth/sign${this.get('type')}`;
		const credentials = this.get( 'credentials' );
		const options = { 
			method: 'POST', 
			body: JSON.stringify( this.get( 'credentials' ) ),
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		};

		fetch( url, options )
			.then( res => {
				return res.json().then( body => {
					if( res.status !== 200 ) throw body.error
					const { token } = body;
					localStorage.token = token;
					this.getUser( token );
				})
			})
			.catch( err => this.set( 'error', err ) );
	}
};

component$1.exports.template = {v:4,t:[{t:4,f:[{p:[2,1,15],t:7,e:"h2",f:[{t:4,f:[{p:[4,2,47],t:7,e:"label",m:[{n:"class",f:[{t:2,x:{r:["type","."],s:"_0===_1?\"active\":\"inactive\""},p:[4,16,61]}],t:13}],f:["Sign ",{t:2,r:".",p:[5,8,114]}," ",{p:[6,3,127],t:7,e:"input",m:[{n:"type",f:"radio",t:13},{n:"name",f:[{t:2,r:"type",p:[6,29,153]}],t:13},{n:"value",f:[{t:2,r:".",p:[6,46,170]}],t:13}]}]}],n:52,x:{r:[],s:"[\"in\",\"up\"]"},p:[3,2,21]}]}," ",{p:[11,1,209],t:7,e:"form",m:[{n:"submit",f:{x:{r:["@this"],s:"[_0.submit()]"}},t:70}],f:[{p:[12,2,244],t:7,e:"div",f:[{p:[13,3,252],t:7,e:"label",f:["User name: ",{p:[14,15,274],t:7,e:"input",m:[{n:"placeholder",f:"your username",t:13},{n:"required",f:0,t:13},{n:"value",f:[{t:2,r:"credentials.username",p:[14,66,325]}],t:13}]}]}]}," ",{p:[18,2,373],t:7,e:"div",f:[{p:[19,3,381],t:7,e:"label",f:["Password: ",{p:[20,14,402],t:7,e:"input",m:[{n:"required",f:0,t:13},{n:"type",f:[{t:2,x:{r:["showPassword"],s:"_0?\"text\":\"password\""},p:[20,36,424]}],t:13},{n:"value",f:[{t:2,r:"credentials.password",p:[20,83,471]}],t:13}]}]}]}," ",{p:[23,2,518],t:7,e:"div",f:[{p:[24,3,526],t:7,e:"label",f:[{p:[25,4,537],t:7,e:"input",m:[{n:"type",f:"checkbox",t:13},{n:"checked",f:[{t:2,r:"showPassword",p:[25,36,569]}],t:13}]}," show password"]}]}," ",{p:[29,2,623],t:7,e:"button",m:[{n:"type",f:"submit",t:13}],f:["OK"]}]}," ",{p:[32,1,666],t:7,e:"pre",m:[{n:"class",f:"error",t:13}],f:[{t:2,r:"error",p:[32,20,685]}]}],n:50,r:"loaded",p:[1,1,0]}],e:{"_0===_1?\"active\":\"inactive\"":function (_0,_1){return(_0===_1?"active":"inactive");},"[\"in\",\"up\"]":function (){return(["in","up"]);},"[_0.submit()]":function (_0){return([_0.submit()]);},"_0?\"text\":\"password\"":function (_0){return(_0?"text":"password");}}};
var __import0__ = Ractive.extend( component$1.exports );

var component$2 = { exports: {} };

component$2.exports = {
    data: {
        pirate: null,
        pirates: null,
        crews: null
    },
    getHeaders() {
        const token = this.get('user.token');
        return new Headers({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		});
    },
    oninit() {
        const headers = this.getHeaders();

        fetch( '/api/pirates', { headers } )
            .then( res => res.json() )
            .then( pirates => this.set({ pirates }) )
            .catch(err => console.error(err));

        fetch('/api/crews', { headers })
            .then(res => res.json())
            .then(crews => this.set({ crews }))
            .catch(err => console.error(err));

        this.observe('pirates.*.crewId', (crewId, o, k, index) => {
            const pirateId = this.get('pirates')[index]._id;

            fetch( `/api/crews/${crewId}/pirates/${pirateId}`, { 
                method: 'put',
                headers
            })
            .then( res => res.json() )
            .then( pirate => {
                console.log('pirate updated');
            })
            .catch(err => console.error(err));
        }, { init: false });
    },
    addNew() {
        const pirate = this.get('pirate');
        if(!pirate) return;
        
        const headers = this.getHeaders();

        fetch( '/api/pirates', { 
            method: 'post',
            headers,
            body: JSON.stringify(pirate) 
        })
        .then( res => res.json() )
        .then( pirate => {
            this.set('pirate');
            this.push('pirates', pirate);
            document.activeElement.blur();
        });

    }
};

component$2.exports.template = {v:4,t:[{p:[1,1,0],t:7,e:"h2",f:["Pirates!"]}," ",{p:[3,1,19],t:7,e:"ul",f:[{t:4,f:[{p:[5,5,50],t:7,e:"li",f:[{p:[6,9,63],t:7,e:"span",f:[{t:2,r:".name",p:[6,15,69]}]}," (",{t:2,r:".rank",p:[6,33,87]},") ",{t:2,r:"crewId.name",p:[7,9,107]}," ",{p:[8,9,131],t:7,e:"select",m:[{n:"value",f:[{t:2,r:".crewId",p:[8,24,146]}],t:13}],f:[{p:[9,13,172],t:7,e:"option",m:[{n:"selected",f:0,t:13},{n:"disabled",f:0,t:13}],f:["Select a crew"]}," ",{t:4,f:[{p:[11,17,265],t:7,e:"option",m:[{n:"value",f:[{t:2,r:"_id",p:[11,32,280]}],t:13}],f:[{t:2,r:"name",p:[11,41,289]}]}],n:52,r:"crews",p:[10,13,233]}]}]}],n:52,r:"pirates",p:[4,5,28]}," ",{p:[16,5,375],t:7,e:"li",f:[{p:[17,9,388],t:7,e:"form",m:[{n:"onsubmit",f:"return false;",t:13},{n:"submit",f:{x:{r:["@this"],s:"[_0.addNew()]"}},t:70}],f:[{p:[18,13,459],t:7,e:"div",f:["name: ",{p:[18,24,470],t:7,e:"input",m:[{n:"value",f:[{t:2,r:"pirate.name",p:[18,38,484]}],t:13},{n:"required",f:0,t:13}]}]}," ",{p:[19,13,529],t:7,e:"div",f:["rank: ",{p:[19,24,540],t:7,e:"input",m:[{n:"value",f:[{t:2,r:"pirate.rank",p:[19,38,554]}],t:13},{n:"required",f:0,t:13}]}]}," ",{p:[20,13,599],t:7,e:"div",f:[{p:[20,18,604],t:7,e:"button",m:[{n:"type",f:"submit",t:13}],f:["Add"]}]}]}]}]}],e:{"[_0.addNew()]":function (_0){return([_0.addNew()]);}}};
component$2.exports.css = "span{font-weight:bolder}";
var __import1__ = Ractive.extend( component$2.exports );

var component$3 = { exports: {} };

component$3.exports = {
    data: {
        crew: null
    },
    oninit() {
        const headers = this.getHeaders();

        fetch('/api/crews', { headers })
            .then(res => res.json())
            .then(crews => this.set({ crews }))
            .catch(err => console.error(err));
    },
    getHeaders() {
        const token = this.get('user.token');
        return new Headers({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		});
    },
    addNew() {
        const crew = this.get('crew');
        if(!crew) return;
        
        const headers = this.getHeaders();

        fetch( '/api/crews', { 
            method: 'post',
            headers,
            body: JSON.stringify(crew) 
        })
        .then( res => res.json() )
        .then( crew => {
            this.set('crew');
            this.push('crews', crew);
            document.activeElement.blur();
        });

    }
};

component$3.exports.template = {v:4,t:[{p:[1,1,0],t:7,e:"h2",f:["Crews!"]}," ",{p:[3,1,17],t:7,e:"ul",f:[{t:4,f:[{p:[5,5,46],t:7,e:"li",f:[{p:[6,9,59],t:7,e:"img",m:[{n:"class",f:"flag",t:13},{n:"src",f:[{t:2,r:"flag",p:[6,32,82]}],t:13}]}," ",{t:2,r:"name",p:[7,9,101]}]}],n:52,r:"crews",p:[4,5,26]}," ",{p:[10,5,139],t:7,e:"li",f:[{p:[11,9,152],t:7,e:"form",m:[{n:"onsubmit",f:"return false;",t:13},{n:"submit",f:{x:{r:["@this"],s:"[_0.addNew()]"}},t:70}],f:[{p:[12,13,223],t:7,e:"div",f:["name: ",{p:[12,24,234],t:7,e:"input",m:[{n:"value",f:[{t:2,r:"crew.name",p:[12,38,248]}],t:13},{n:"required",f:0,t:13}]}]}," ",{p:[13,13,291],t:7,e:"div",f:["flag url: ",{p:[13,28,306],t:7,e:"input",m:[{n:"value",f:[{t:2,r:"crew.flag",p:[13,42,320]}],t:13},{n:"required",f:0,t:13}]}]}," ",{p:[14,13,363],t:7,e:"div",f:[{p:[14,18,368],t:7,e:"button",m:[{n:"type",f:"submit",t:13}],f:["Add"]}]}]}]}]}],e:{"[_0.addNew()]":function (_0){return([_0.addNew()]);}}};
component$3.exports.css = ".flag{height:50px;width:auto}";
var __import2__ = Ractive.extend( component$3.exports );

var component = { exports: {} };

component.exports = {
    data: {
        user: undefined,
        page: 'pirates'
    },
    logout() {
        localStorage.removeItem('token');
        this.set('user');
    }
};

component.exports.template = {v:4,t:[{p:[5,1,125],t:7,e:"h1",f:["Pirates!"]}," ",{t:4,f:[{p:[8,5,161],t:7,e:"h3",f:["Hello ",{t:2,r:"user.username",p:[8,15,171]}," ",{p:[8,33,189],t:7,e:"span",m:[{n:"click",f:{x:{r:["@this"],s:"[_0.logout()]"}},t:70}],f:["logout"]}]}," ",{p:[9,5,244],t:7,e:"h2",f:[{t:4,f:[{p:[11,9,298],t:7,e:"label",m:[{n:"class",f:[{t:2,x:{r:["page","."],s:"_0===_1?\"active\":\"inactive\""},p:[11,23,312]}],t:13}],f:[{t:2,r:".",p:[12,13,370]}," ",{p:[13,13,393],t:7,e:"input",m:[{n:"type",f:"radio",t:13},{n:"name",f:[{t:2,r:"page",p:[13,39,419]}],t:13},{n:"value",f:[{t:2,r:".",p:[13,56,436]}],t:13}]}]}],n:52,x:{r:[],s:"[\"pirates\",\"crews\"]"},p:[10,9,257]}]}," ",{t:4,f:[{p:[18,9,531],t:7,e:"pirates"}],n:50,x:{r:["page"],s:"_0===\"pirates\""},p:[17,5,496]},{t:4,n:51,f:[{p:[20,9,572],t:7,e:"crews"}],l:1}],n:50,r:"user",p:[7,1,144]},{t:4,n:51,f:[{p:[23,5,613],t:7,e:"auth",m:[{n:"user",f:[{t:2,r:"user",p:[23,17,625]}],t:13}]}],l:1}],e:{"[_0.logout()]":function (_0){return([_0.logout()]);},"_0===_1?\"active\":\"inactive\"":function (_0,_1){return(_0===_1?"active":"inactive");},"[\"pirates\",\"crews\"]":function (){return(["pirates","crews"]);},"_0===\"pirates\"":function (_0){return(_0==="pirates");}}};
component.exports.css = "h3>span{text-decoration:underline;font-size:small;cursor:pointer}";
component.exports.components = { auth: __import0__, pirates: __import1__, crews: __import2__ };
var app = Ractive.extend( component.exports );

return app;

}(Ractive));
