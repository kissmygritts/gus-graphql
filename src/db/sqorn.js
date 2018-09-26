import sqorn from 'sqorn-pg'

const connection = {
  connectionString: 'postgresql://mitchellgritts@localhost:5432/gus_dev'
}
export const sq = sqorn({ connection })
