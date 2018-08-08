export interface RealmDTO {
	/** Legacy script mode for IE6 or older. */
	lg: string
	/** Latest changed version of Dragon Magic. */
	dd: string
	/** Default language for this realm */
	l: string
	/** Latest changed version for each data type listed.*/
	n: { [key: string]: string }
	/** Special behavior number identifying the largest profile icon ID that can be used under 500.
	 * Any profile icon that is requested between this number and 500 should be mapped to 0.*/
	profileiconmax: number
	/** Additional API data drawn from other sources that may be related to Data Dragon functionality.*/
	store: string
	/** Current version of this file for this realm. */
	v: string
	/** The base CDN URL. */
	cdn: string
	/** Latest changed version of Dragon Magic's CSS file. */
	css: string

}