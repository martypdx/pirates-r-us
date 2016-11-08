import ractive from 'rollup-plugin-ractive';

export default {
	entry: 'src/app.html',
	dest: './public/bundle.js',
	plugins: [ ractive() ],
	external: [ 'ractive' ],
	globals: { ractive: 'Ractive' },
	format: 'iife',
	moduleName: 'App'
};