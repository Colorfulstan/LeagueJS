export interface ListDTO<dataType> {
	type:string
	version:string
	data: {[key:string]: dataType}
}